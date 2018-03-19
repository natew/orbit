// @flow
import Bridge from './helpers/Bridge'
import proxySetters from './helpers/proxySetters'
import { store, react } from '@mcro/black/store'
import global from 'global'
import Desktop from './Desktop'
import Electron from './Electron'

const log = debug('App')
let App

@store
class AppStore {
  state = {
    query: '',
    selectedItem: null,
    openResult: null,
    highlightWords: {},
    hoveredWord: null,
    hoveredLine: null,
    contextMessage: 'Orbit',
    closePeek: null,
    orbitHidden: true,
    knowledge: null,
    peekTarget: null,
    shouldTogglePinned: null,
  }

  get isShowingOrbit() {
    return (
      Electron.orbitState.fullScreen ||
      Electron.orbitState.pinned ||
      !App.state.orbitHidden
    )
  }

  get isShowingPeek() {
    return !!App.state.peekTarget || Electron.orbitState.fullScreen
  }

  get isAttachedToWindow() {
    return !Electron.orbitState.fullScreen && !!Desktop.state.appState
  }

  get hoveredWordName() {
    return 'none for now'
  }

  get isShowingHeader() {
    return (
      Electron.orbitState.fullScreen ||
      Electron.orbitState.mouseOver ||
      Electron.orbitState.pinned
    )
  }

  start(options) {
    Bridge.start(this, this.state, options)
    this.setState = Bridge.setState
    this.bridge = Bridge
  }

  runReactions() {
    const AppReactions = require('./AppReactions').default
    this.reactions = new AppReactions()
  }

  togglePinned = () => {
    this.setState({ shouldTogglePinned: Date.now() })
  }

  togglePeek = () => {
    this.setState({ disablePeek: !this.state.disablePeek })
  }

  toggleHidden = () => {
    this.setState({ hidden: !this.state.hidden })
  }

  openSettings = () => {
    this.setState({ openSettings: Date.now() })
  }
}

App = proxySetters(new AppStore())
global.App = App
Bridge.stores.AppStore = App

export default App
