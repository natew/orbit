// @flow
import { watch } from '@mcro/black'
import { CurrentUser, Thing } from '~/app'
import Router from '~/router'
import { OS } from '~/helpers'
import * as Constants from '~/constants'

const SHORTCUTS = {
  left: 'left',
  right: 'right',
  down: 'down',
  up: 'up',
  j: 'j', // down
  k: 'k', // up
  d: 'd', // doc
  enter: 'enter',
  esc: 'esc',
  explorer: ['command+t'],
  cmdA: 'command+a',
  cmdL: 'command+l',
  cmdEnter: 'command+enter',
  cmdUp: 'command+up',
  cmdR: 'command+r',
  delete: ['delete', 'backspace'],
  togglePane: 'shift+tab',
}

export default class RootStore {
  showBrowse = false

  start() {
    // listen to Ionize
    if (Constants.APP_KEY) {
      OS.on('app-goto', (event, arg) => {
        console.log('appgoto', arg)
        Router.go(arg)
      })
      OS.send('where-to', Constants.APP_KEY)
    }
  }

  @watch
  document = () => {
    if (Router.path === '/') {
      return CurrentUser.home
    }
    if (Router.params.id) {
      return Thing.get(Router.params.id)
    }
  }

  @watch
  crumbs = [
    () => this.document && this.document.id,
    () => this.document && this.document.getCrumbs(),
  ]

  @watch
  children = [
    () => [this.document && this.document.id, this.showBrowse],
    () => this.document && this.document.getChildren({ depth: Infinity }),
  ]

  shortcuts = SHORTCUTS

  actions = {
    cmdR: () => {
      window.location.href = window.location.href
    },
    toggleSidebar: () => {
      OS.send('app-bar-toggle', Constants.APP_KEY)
    },
  }
}