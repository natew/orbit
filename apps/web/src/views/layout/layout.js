// @flow
import React from 'react'
import * as Constants from '~/constants'
import { view } from '@mcro/black'
import * as UI from '@mcro/ui'
import NotFound from '~/apps/error/404'
import Router from '~/router'
import Errors from '~/views/layout/errors'
import LayoutWrap from '~/views/layout/wrap'
import Signup from '~/views/signup'
import { CurrentUser } from '~/app'
import Header from './header'
import BottomBar from '~/views/bottomBar'

type Props = {
  layoutStore: LayoutStore,
  soundStore: SoundStore,
}

@view
export default class Layout {
  props: Props

  state = {
    error: null,
  }

  componentDidMount() {
    window.lastInstance = this
  }

  lastScrolledTo = 0
  onScroll = e => {
    this.lastScrolledTo = e.currentTarget.scrollTop
  }

  render() {
    if (Constants.IS_BAR) {
      console.log('Constants.IS_BAR')
      const CurrentPage = Router.activeView || <null>no way</null>
      return <CurrentPage />
    }

    const CurrentPage = Router.activeView || NotFound

    return (
      <layout>
        <UI.Theme name="light">
          <UI.SlotFill.Provider>
            <content>
              <Signup />
              <LayoutWrap>
                <Header if={!!Constants.APP_KEY} />
                <content if={CurrentUser.loggedIn} onScroll={this.onScroll}>
                  <CurrentPage key={Router.key} {...Router.params} />
                </content>
              </LayoutWrap>
              <Errors />
              <BottomBar />
            </content>
          </UI.SlotFill.Provider>
        </UI.Theme>
      </layout>
    )
  }

  static style = {
    layout: {
      background: Constants.IS_ELECTRON ? [42, 42, 45, 0.2] : 'transparent',
      position: 'absolute',
      flex: 1,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    hide: {
      opacity: 0,
      pointerEvents: 'none',
    },
    content: {
      flex: 1,
    },
  }
}
