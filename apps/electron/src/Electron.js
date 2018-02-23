import * as React from 'react'
import { App } from '@mcro/reactron'
import ShortcutsStore from '~/stores/shortcutsStore'
import { view, debugState } from '@mcro/black'
import Tray from './views/Tray'
import MenuItems from './views/MenuItems'
import HighlightsWindow from './views/HighlightsWindow'
import OraWindow from './views/OraWindow'
import PeekWindow from './views/PeekWindow'
import SettingsWindow from './views/SettingsWindow'
import * as Helpers from '~/helpers'
import Screen from '@mcro/screen'
import global from 'global'
import { screen } from 'electron'
import * as Constants from '~/constants'

@view.provide({
  electron: class ElectronStore {
    error = null
    appRef = null
    oraRef = null
    stores = null
    views = null

    willMount() {
      global.App = this
      debugState(({ stores, views }) => {
        this.stores = stores
        this.views = views
      })

      // setup screen
      const { position, size } = Helpers.getAppSize()
      const screenSize = screen.getPrimaryDisplay().workAreaSize
      const oraPosition = [screenSize.width - Constants.ORA_WIDTH, 20]
      Screen.start('electron', {
        shouldHide: null,
        shouldShow: null,
        shouldPause: null,
        peekState: {},
        focused: false,
        showSettings: false,
        showDevTools: {
          app: false,
          peek: false,
          highlights: false,
          settings: true,
        },
        lastMove: Date.now(),
        show: true,
        settingsPosition: position,
        size,
        screenSize,
        oraPosition,
      })

      new ShortcutsStore().emitter.on('shortcut', shortcut => {
        console.log('emit shortcut', shortcut)
        if (shortcut === 'Option+Space') {
          if (Screen.desktopState.keyboard.option) {
            console.log('avoid toggle while holding option')
            return
          }
          this.toggleShown()
        }
      })

      this.watchOptionPress()
      this.watchMouseEnter()
    }

    watchOptionPress = () => {
      // watch option hold
      let lastKeyboard = {}
      let justCleared = false
      let optnEnter
      let optnLeave
      this.react(() => Screen.desktopState.keyboard, function reactToKeyboard(
        keyboard,
      ) {
        if (!keyboard) return
        clearTimeout(optnLeave)
        const { option, optionCleared } = keyboard
        if (Screen.appState.hidden) {
          // HIDDEN
          // clear last if not opened yet
          if (optionCleared) {
            clearTimeout(optnEnter)
          }
          // delay before opening on option
          if (!lastKeyboard.option && option) {
            optnEnter = setTimeout(this.showOra, 150)
          }
        } else {
          // SHOWN
          // dont toggle
          if (optionCleared) {
            justCleared = true
            return
          }
          // an option event comes again after cleared saying its false
          if (justCleared) {
            justCleared = false
            return
          }
          if (lastKeyboard.option && !option) {
            optnLeave = setTimeout(this.hideOra, 40)
          }
        }
        lastKeyboard = keyboard
      })
    }

    focused = false

    watchMouseEnter = () => {
      this.react(
        () => Screen.desktopState.mousePosition,
        ({ x, y }) => {
          if (!Screen.state.peekState.windows) return
          const peek = Screen.state.peekState.windows[0]
          if (!peek) return
          const { position, size } = peek
          const withinX = x > position[0] && x < position[0] + size[0]
          const withinY = y > position[1] && y < position[1] + size[1]
          this.focused = withinX && withinY
        },
      )
      this.react(
        () => this.focused,
        shouldFocus => {
          if (Screen.desktopState.hidden) {
            return
          }
          console.log('handling focus', shouldFocus)
          if (shouldFocus) {
            this.peekRef && this.peekRef.focus()
          } else {
            Screen.swiftBridge.defocus()
          }
        },
      )
    }

    restart() {
      if (process.env.NODE_ENV === 'development') {
        require('touch')(require('path').join(__dirname, '..', 'package.json'))
      }
    }

    toggleShown = async () => {
      if (Screen.appState.pinned) return
      if (!this.appRef) return
      if (!Screen.appState.hidden) {
        this.hideOra()
      } else {
        this.showOra()
      }
    }

    async showOra() {
      this.appRef.show()
      Screen.setState({ shouldShow: Date.now() })
      // await Helpers.sleep(250) // animate
      // this.appRef && this.appRef.focus()
      // this.oraRef && this.oraRef.focus()
    }

    async hideOra() {
      Screen.setState({ shouldHide: Date.now() })
      // await Helpers.sleep(150) // animate
      // if (
      //   !Screen.state.settingsVisible &&
      //   !Screen.appState.preventElectronHide
      // ) {
      //   this.appRef.hide()
      // }
    }

    handleAppRef = ref => ref && (this.appRef = ref.app)
    handleOraRef = ref => (this.oraRef = ref)
    handlePeekRef = ref => (this.peekRef = ref)
    handleBeforeQuit = () => console.log('before quit')
    handleQuit = () => {
      console.log('handling quit')
      process.exit(0)
    }
  },
})
@view.electron
export default class Root extends React.Component {
  componentDidCatch(error) {
    console.error(error)
    this.props.electron.error = error
  }

  render({ electron }) {
    if (electron.error) {
      return null
    }
    return (
      <App
        onBeforeQuit={electron.handleBeforeQuit}
        onQuit={electron.handleQuit}
        ref={electron.handleAppRef}
      >
        <MenuItems />
        <HighlightsWindow />
        {/* <OraWindow onRef={electron.handleOraRef} /> */}
        <PeekWindow
          onPeekRef={electron.handlePeekRef}
          appPosition={Screen.state.oraPosition.slice(0)}
        />
        {/* <SettingsWindow /> */}
        <Tray />
      </App>
    )
  }
}
