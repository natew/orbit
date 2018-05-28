import * as React from 'react'
import { view } from '@mcro/black'
import * as UI from '@mcro/ui'
import { OrbitFrame } from './orbitFrame'
import { OrbitSearchResults } from './orbitSearchResults'
import { OrbitHeader } from './orbitHeader'
import { App, Desktop } from '@mcro/all'
import { throttle } from 'lodash'
import { Title, SubTitle } from '~/views'
import { ResultsPage } from '~/apps/ResultsPage'
import * as Constants from '~/constants'

class PaneStore {
  get activePane() {
    if (App.state.query) {
      return 'search'
    }
    return 'context'
  }
}

@UI.injectTheme
@view.attach('orbitPage')
@view.provide({
  paneStore: PaneStore,
})
@view
class Orbit {
  state = {
    resultsRef: null,
    isScrolled: false,
  }

  setRef = resultsRef => {
    if (resultsRef) {
      this.setState({ resultsRef })
      this.on(
        resultsRef,
        'scroll',
        throttle(() => {
          if (resultsRef.scrollTop > 0) {
            if (!this.state.isScrolled) {
              this.setState({ isScrolled: true })
            }
          } else {
            if (this.state.isScrolled) {
              this.setState({ isScrolled: false })
            }
          }
        }, 16),
      )
    }
  }

  render({ orbitPage, theme }) {
    const headerBg = theme.base.background
    const { orbitOnLeft } = App
    return (
      <OrbitFrame headerBg={headerBg} orbitPage={orbitPage}>
        <OrbitHeader headerBg={headerBg} />
        <orbitInner>
          <orbitContext>
            <contextHeader css={{ textAlign: orbitOnLeft ? 'right' : 'left' }}>
              <Title ellipse={1}>{Desktop.appState.name}</Title>
              <SubTitle if={Desktop.appState.title} ellipse={2}>
                {Desktop.appState.title}
              </SubTitle>
            </contextHeader>
            <ResultsPage />
          </orbitContext>
          <OrbitSearchResults name="context-search" parentPane="context" />
        </orbitInner>
      </OrbitFrame>
    )
  }

  static style = {
    orbitInner: {
      position: 'relative',
      flex: 1,
      zIndex: 10,
    },
    orbitContext: {
      borderBottomRadius: Constants.BORDER_RADIUS,
      position: 'relative',
      height: 'calc(100% - 35px)',
      transition: 'transform ease-in-out 150ms',
      zIndex: 100,
    },
    contextHeader: {
      padding: [15, 0, 0],
    },
    results: {
      flex: 1,
    },
    fade: {
      position: 'fixed',
      left: 0,
      right: 0,
      top: 13,
      height: 60,
      opacity: 0,
      zIndex: 100000,
      transition: 'opacity ease-in-out 150ms',
    },
    fadeVisible: {
      zIndex: 10000,
      opacity: 1,
    },
  }

  static theme = (props, theme) => {
    return {
      fade: {
        background: `linear-gradient(${
          theme.base.background
        } 40%, transparent)`,
      },
      fadeNotifications: {
        background: `linear-gradient(transparent 45%, ${
          theme.base.background
        })`,
      },
    }
  }
}

export default props => (
  <UI.Theme name="dark">
    <Orbit {...props} />
  </UI.Theme>
)
