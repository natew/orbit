import { App, Electron, Desktop } from '@mcro/all'
import { isEqual, store, react, debugState } from '@mcro/black'
import { ShortcutsStore } from '~/stores/shortcutsStore'
import { WindowFocusStore } from '~/stores/windowFocusStore'
import {} from '@mcro/black'
import root from 'global'

@store
export class ElectronStore {
  shortcutStore?: ShortcutsStore = null
  windowFocusStore?: WindowFocusStore = null
  error = null
  appRef = null
  stores = null
  views = null
  orbitRef = null
  clear = Date.now()
  show = 2

  async didMount() {
    root.Root = this
    root.restart = this.restart
    debugState(({ stores, views }) => {
      this.stores = stores
      this.views = views
    })
    await Electron.start({
      ignoreSelf: true,
    })
    root.el = Electron
    this.windowFocusStore = new WindowFocusStore()
    this.shortcutStore = new ShortcutsStore([
      'Option+Space',
      'Option+Shift+Space',
      'CommandOrControl+Space',
    ])
    // @ts-ignore
    this.shortcutStore.emitter.on('shortcut', Electron.reactions.onShortcut)
    Electron.onMessage(msg => {
      switch (msg) {
        case Electron.messages.CLEAR:
          this.clear = Date.now()
          return
        case Electron.messages.DEFOCUS:
          this.windowFocusStore.defocusOrbit()
          return
        case Electron.messages.FOCUS:
          this.windowFocusStore.focusOrbit()
          return
      }
    })
    Electron.onClear = () => {
      // log(`Electron.onClear`)
      this.clear = Date.now()
    }
    // clear to start
    Electron.onClear()
  }

  clearApp = react(
    () => this.clear,
    async (_, { when, sleep }) => {
      if (!this.appRef) {
        throw react.cancel
      }
      this.appRef.hide()
      const getState = () => ({
        ...Desktop.appState,
        ...Electron.state.orbitState,
      })
      const lastState = getState()
      this.show = 0
      Electron.sendMessage(App, App.messages.HIDE)
      await when(() => !App.isShowingOrbit) // ensure hidden
      await when(() => !isEqual(getState(), lastState)) // ensure moved
      this.show = 1 // now render with 0 opacity so chrome updates visuals
      await sleep(50) // likely not necessary, ensure its ready for app show
      this.appRef.show() // downstream apps should now be hidden
      await sleep(200) // finish rendering, could be a when(() => App.isRepositioned)
      await when(() => !Desktop.mouseState.mouseDown) // ensure not moving window
      this.show = 2
    },
  )

  // focus on pinned
  focusOnPin = react(
    () => App.orbitState.pinned,
    pinned => {
      // only focus on option+space
      if (Electron.lastAction !== 'Option+Space') {
        return
      }
      if (pinned) {
        this.appRef.focus()
      }
    },
    { delay: App.animationDuration },
  )

  restart() {
    if (process.env.NODE_ENV === 'development') {
      require('touch')(require('path').join(__dirname, '..', '_', 'index.js'))
    }
  }

  handleAppRef = ref => {
    if (!ref) return
    this.appRef = ref.app
    // this.appRef.dock.hide()
  }
  handleBeforeQuit = () => console.log('before quit')
  handleQuit = () => {
    process.exit(0)
  }
}