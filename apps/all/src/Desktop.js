// @flow
import Bridge from './helpers/Bridge'
import { store } from '@mcro/black/store'
import global from 'global'
// import App from './App'

// const log = debug('Desktop')
const PAD_WINDOW = 15

type TappState = {
  name: string,
  offset: [Number, Number],
  bounds: [Number, Number],
  screen: [Number, Number],
}

type Word = {
  word: string,
  weight: Number,
  top: Number,
  left: Number,
  width: Number,
  height: Number,
}

export type DesktopState = {
  appState?: TappState,
  ocrWords?: [Word],
  linePositions?: [Number],
  lastOCR: Number,
  lastScreenChange: Number,
  mousePosition: { x: Number, y: Number },
  keyboard: Object,
  highlightWords: { [String]: boolean },
  clearWords: { [String]: Number },
  restoreWords: { [String]: Number },
  pluginResults: [{}],
}

let Desktop

@store
class DesktopStore {
  state = {
    shouldTogglePin: null,
    paused: true,
    pluginResults: [],
    appState: {},
    ocrWords: null,
    linePositions: null,
    lastOCR: Date.now(),
    lastScreenChange: Date.now(),
    mousePosition: { x: 0, y: 0 },
    keyboard: {},
    clearWords: {},
    restoreWords: {},
    selection: null,
  }

  get isHoldingOption(): Boolean {
    const { option, optionUp } = this.state.keyboard
    return option && optionUp && option > (optionUp || 0)
  }

  get linesBoundingBox() {
    const { linePositions } = Desktop.state
    if (!linePositions) return null
    let left = 100000
    let maxX = 0
    let top = 100000
    let maxY = 0
    // found place for window to go
    for (const [lx, ly, lw, lh] of linePositions) {
      if (lx + lw > maxX) maxX = lx + lw
      if (lx < left) left = lx
      if (ly < top) top = ly
      if (ly + lh > maxY) maxY = ly + lh
    }
    // maxX should never be past right edge of window frame
    // this fixes logical issues in line finding from swift for now
    if (Desktop.state.appState) {
      const { offset, bounds } = Desktop.state.appState
      maxX = Math.min(
        offset[0] + bounds[0] - PAD_WINDOW * 2 /* reverse linepad */,
        maxX,
      )
    }
    return { left, top, width: maxX - left, height: maxY - top }
  }

  start(options) {
    Bridge.start(this, this.state, options)
    this.setState = Bridge.setState
  }

  updateKeyboard = newState =>
    this.setState({ keyboard: { ...this.state.keyboard, ...newState } })

  // only clear if necessary
  clearOption = () => {
    const { option, optionUp } = this.state
    if (!option || !optionUp || option > optionUp) {
      this.updateKeyboard({ optionUp: Date.now() })
    }
  }
}

Desktop = new DesktopStore()
global.Desktop = Desktop
Bridge.stores.DesktopStore = Desktop

export default Desktop
