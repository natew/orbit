// @flow
import Path from 'path'
import Fs from 'fs-extra'
import { Server } from 'ws'
import Screen from '@mcro/screen'
import ocrScreenshot from '@mcro/ocr'
import getContext from './helpers/getContext'
import { isEqual, throttle } from 'lodash'
import mouse from 'osx-mouse'
import * as Constants from '~/constants'

const APP_ID = 'screen'
const APP_SCREEN_PATH = Path.join(Constants.TMP_DIR, `${APP_ID}.png`)
const DEBOUNCE_OCR = 1000
const TOP_BAR_HEIGHT = 23

type TContext = {
  appName: string,
  offset: [Number, Number],
  bounds: [Number, Number],
}

type Word = {
  word: string,
  weight: Number,
  top: Number,
  left: Number,
  width: Number,
  height: Number,
}

type TScreenState = {
  context?: TContext,
  ocr?: Array<Word>,
  lastOCR: Number,
  lastScreenChange: Number,
  mousePosition: [Number, Number],
}

export default class ScreenState {
  stopped = false
  invalidRunningOCR = Date.now()
  hasNewOCR = false
  runningOCR = false
  screenDestination = Constants.TMP_DIR
  video = new Screen()
  wss = new Server({ port: 40510 })
  activeSockets = []
  id = 0
  nextOCR = null

  state: TScreenState = {
    context: null,
    ocr: null,
    lastOCR: Date.now(),
    lastScreenChange: Date.now(),
    mousePosition: [0, 0],
  }

  constructor() {
    this.wss.on('connection', socket => {
      let uid = this.id++
      socket.on('message', str => {
        const { action, value } = JSON.parse(str)
        if (this[action]) {
          console.log('received action:', action)
          this[action].call(this, value)
        }
      })
      socket.on('close', () => {
        this.removeSocket(uid)
      })
      socket.on('error', (...args) => {
        console.log('error', ...args)
        this.removeSocket(uid)
      })
      this.activeSockets.push({ uid, socket })
    })
    this.wss.on('close', () => {
      console.log('WE SHOULD HANDLE THIS CLOSE', ...arguments)
    })
    this.wss.on('error', (...args) => {
      console.log('wss error', args)
    })
  }

  get hasListeners() {
    return this.activeSockets.length
  }

  start = () => {
    this.watchMouse()
    this.stopped = false
    this.watchApplication(async context => {
      if (!isEqual(this.state.context, context)) {
        console.log('new context, invalidate ocr', context && context.appName)
        this.cancelCurrentOCR()
        this.updateState({ context })
      }
    })
  }

  watchMouse = () => {
    this.mouse = mouse()
    this.mouse.on(
      'move',
      throttle((x, y) => {
        this.updateState({
          mousePosition: [x, y],
        })
      }, 32),
    )
  }

  cancelCurrentOCR = () => {
    // cancel next OCR if we have a new context
    clearTimeout(this.nextOCR)
    this.invalidRunningOCR = Date.now()
  }

  updateState = object => {
    if (this.stopped) {
      return
    }
    let hasNewState = false
    for (const key of Object.keys(object)) {
      if (!isEqual(this.state[key], object[key])) {
        hasNewState = true
        break
      }
    }
    if (!hasNewState) {
      return
    }
    const oldState = this.state
    this.state = { ...this.state, ...object }
    // sends over (oldState, changedState, newState)
    this.onChangedState(oldState, object, this.state)
    // only send the changed things to reduce overhead
    this.socketSend(object)
  }

  onChangedState = async (oldState, newStateItems) => {
    // no listeners, no need to watch
    if (!this.hasListeners) {
      return
    }
    // const hasNewOCR = !isEqual(prevState.ocr, this.state.ocr)
    // re-watch on different context
    const firstTimeOCR =
      (!oldState.ocr || !oldState.ocr.length) && newStateItems.ocr
    const newContext = newStateItems.context
    if (newContext || firstTimeOCR) {
      console.log(
        're-run screen watch',
        newContext && newContext.appName,
        'firstTimeOCR',
        firstTimeOCR,
      )
      await this.handleNewContext()
    }
  }

  watchApplication = async cb => {
    const context = await getContext()
    await cb(context)
    if (this.stopped) {
      return
    }
    this.watchApplication(cb)
  }

  handleNewContext = async () => {
    const { appName, offset, bounds } = this.state.context

    // test
    if (appName !== 'Simplenote') {
      console.log('not simplenote')
      return
    }

    console.log('watchScreen', appName, { offset, bounds })
    if (!offset || !bounds) {
      console.log('didnt get offset/bounds')
      return
    }

    await this.video.stopRecording()

    const appBox = {
      id: APP_ID,
      x: offset[0],
      y: offset[1],
      width: bounds[0],
      height: bounds[1],
      screenDir: this.screenDestination,
    }

    let settings
    const { ocr } = this.state

    // watch settings
    if (!ocr) {
      // remove old screen
      try {
        await Fs.remove(APP_SCREEN_PATH)
      } catch (err) {
        console.log(err)
      }
      // we are watching the whole app for words
      settings = {
        fps: ocr ? 30 : 2,
        sampleSpacing: 10,
        sensitivity: 2,
        showCursor: false,
        initialScreenshot: true,
        boxes: [appBox],
      }
    } else {
      const boxes = [
        ...ocr.map(({ word, top, left, width, height }) => {
          return {
            id: word,
            x: left,
            y: top + TOP_BAR_HEIGHT,
            width,
            height,
            // to test what boxes its capturing
            // screenDir: this.screenDestination,
          }
        }),
      ]
      // watch just the words to see clears
      settings = {
        fps: 20,
        sampleSpacing: 2,
        sensitivity: 1,
        // show cursor for now to test
        showCursor: true,
        boxes,
      }
    }

    console.log('settings', settings)

    try {
      this.video.startRecording(settings)
    } catch (err) {
      console.log('Error starting recorder:', err.message)
      console.log(err.stack)
    }

    // start a debounced ocr
    this.handleChangedFrame()
    // start watching for diffs too
    this.video.onChangedFrame(this.handleChangedFrame)
  }

  handleChangedFrame = async changedWord => {
    if (this.state.ocr) {
      if (!changedWord) {
        console.log('no word given in change event, but we have ocrs')
      } else {
        if (changedWord !== APP_ID) {
          console.log('got a change for word', changedWord)
          const beforeLen = this.state.ocr.length
          const newOCR = this.state.ocr.filter(x => x.word !== changedWord)
          if (newOCR.length === beforeLen) {
            console.log('weird this word isnt in ocr')
          } else {
            console.log('removing word', changedWord)
            this.updateState({ ocr: newOCR })
          }
          return
        } else {
          console.log(
            'ERROR< shouldnt be reachable (screen diff during ocr words)',
          )
          return
        }
      }
    }
    clearTimeout(this.nextOCR)
    if (this.stopped) {
      return
    }
    if (Date.now() - this.hasNewOCR < 1000) {
      console.log('ocr happened recently so ignore frame diff')
      return
    }
    // this cancels running ocr due to frame change before scheduling next
    if (this.runningOCR) {
      this.cancelCurrentOCR()
    }
    // delays taking OCR for no movement
    this.nextOCR = setTimeout(this.runOCR, DEBOUNCE_OCR)
    this.updateState({
      lastScreenChange: Date.now(),
    })
  }

  runOCR = async () => {
    if (this.runningOCR) {
      console.log('already running ocr, todo: make this wait or something')
      return
    }
    console.log('runOCR')
    let resolveRunningOCR
    this.runningOCR = new Promise(res => {
      resolveRunningOCR = res
    })
    const dateStarted = Date.now()
    const ocr = await this.getOCR()
    console.log('runOCR highlights length:', ocr && ocr.length)
    resolveRunningOCR()
    this.runningOCR = null
    if (this.invalidRunningOCR > dateStarted) {
      console.log('app has changed since this ocr, invalid')
      return
    }
    this.hasNewOCR = Date.now()
    this.updateState({ ocr, lastOCR: Date.now() })
  }

  stop = () => {
    console.log('RECEIVING STOP')
    this.stopped = true
    if (this.video) {
      this.video.stopRecording()
    }
  }

  async getOCR() {
    if (!this.state.context) {
      return
    }
    console.log('running ocr', this.state.context)
    const { offset } = this.state.context
    if (!offset) {
      return
    }
    try {
      const res = await ocrScreenshot({
        inputFile: APP_SCREEN_PATH,
      })
      const { boxes } = res
      const [screenX, screenY] = offset
      return boxes.map(({ name, weight, box }) => {
        // box => { x, y, width, height }
        return {
          word: name,
          weight,
          top: Math.round(box.y / 2 + screenY - TOP_BAR_HEIGHT),
          left: Math.round(box.x / 2 + screenX),
          width: Math.round(box.width / 2),
          height: Math.round(box.height / 2),
        }
      })
    } catch (err) {
      console.log('error with ocr', err.message, err.stack)
    }
  }

  socketSend = data => {
    const strData = JSON.stringify(data)
    for (const { socket, uid } of this.activeSockets) {
      try {
        socket.send(strData)
      } catch (err) {
        this.removeSocket(uid)
      }
    }
  }

  removeSocket = uid => {
    this.activeSockets = this.activeSockets.filter(s => s.uid === uid)
  }

  dispose() {
    this.stopDiff()
    this.mouse.destroy()
  }
}