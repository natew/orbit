import { store, react } from '@mcro/black/store'
// import * as Constants from '@mcro/constants'
import { Desktop } from './Desktop'
import { Electron } from './Electron'
import { App } from './App'

// todo: move this reaction stuff into specialized sub-stores of appstore
// prevents hard restarts
// and groups by logical unit (piece of state)

@store
export default class AppReactions {
  constructor({ onPinKey }) {
    App.onMessage(async msg => {
      switch (msg) {
        case App.messages.TOGGLE_SHOWN:
          this.toggle()
          return
        case App.messages.HIDE:
          this.hide()
          return
        case App.messages.SHOW:
          this.show()
          return
        case App.messages.HIDE_PEEK:
          return App.setPeekTarget(null)
      }
      if (msg.indexOf(App.messages.PIN) === 0) {
        const key = msg.split('-')[1]
        onPinKey(key.toLowerCase())
      }
    })
  }

  toggle() {
    if (App.state.orbitHidden) {
      this.show()
    } else {
      this.hide()
    }
  }

  show() {
    App.setOrbitHidden(false)
  }

  async hide() {
    if (App.state.peekTarget) {
      App.setPeekTarget(null)
      await new Promise(res => setTimeout(res, 80)) // sleep 80
    }
    App.setOrbitHidden(true)
  }

  @react
  clearPeekTargetOnOrbitClose = [
    () => !App.isShowingOrbit,
    hidden => {
      if (!hidden) {
        throw react.cancel
      }
      App.setPeekTarget(null)
    },
  ]

  @react
  onFullScreen = [
    () => Electron.orbitState.fullScreen,
    full => {
      if (full) {
        App.setOrbitHidden(false)
      } else {
        App.setPeekTarget(null)
      }
    },
  ]

  @react
  onPinned = [
    () => Electron.orbitState.pinned,
    pinned => {
      if (pinned) {
        App.setOrbitHidden(false)
      } else {
        App.setOrbitHidden(true)
      }
    },
  ]

  @react
  clearPeekOnReposition = [
    () => Electron.orbitState.position,
    () => App.setPeekTarget(null),
  ]

  @react
  closePeekOnMouseOut = [
    () => Electron.peekState.mouseOver,
    async (mouseOver, { sleep }) => {
      if (mouseOver || Electron.orbitState.mouseOver) {
        return
      }
      // wait a bit
      await sleep(400)
      App.setPeekTarget(null)
    },
  ]

  @react({
    delay: 32,
  })
  hideOrbitOnMouseOut = [
    () => [
      !App.state.orbitHidden,
      Electron.orbitState.mouseOver || Electron.peekState.mouseOver,
      // react to peek closing to see if app should too
      App.state.peekTarget,
    ],
    async ([isShown, mouseOver, peekTarget], { sleep }) => {
      if (!isShown) {
        return
      }
      const peekGoingAway =
        Electron.orbitState.mouseOver &&
        !Electron.orbitState.mouseOver &&
        !peekTarget
      if (mouseOver && !peekGoingAway) {
        return
      }
      // some leeway on mouse leave
      await sleep(150)
      if (Desktop.isHoldingOption || App.isAnimatingOrbit) {
        return
      }
      if (Electron.orbitState.pinned || Electron.orbitState.fullScreen) {
        return
      }
      if (Electron.orbitState.dockedPinned) {
        return
      }
      console.log(`hiding orbit from mouseout`)
      App.setOrbitHidden(true)
    },
  ]

  @react
  showOrbitOnHoverWord = [
    () => App.hoveredWordName,
    async (word, { sleep }) => {
      if (Desktop.isHoldingOption) {
        return
      }
      const orbitHidden = !word
      await sleep(orbitHidden ? 50 : 500)
      App.setOrbitHidden(orbitHidden)
    },
  ]
}