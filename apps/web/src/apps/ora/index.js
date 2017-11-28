import * as React from 'react'
import { view } from '@mcro/black'
import * as UI from '@mcro/ui'
import OraStore from './oraStore'
import Sidebar from './panes/sidebar'
import OraHeader from './oraHeader'
import OraDrawer from './oraDrawer'
import OraActionBar from './oraActionBar'
import OraBlur from './oraBlur'
import * as Constants from '~/constants'

const itemProps = {
  size: 1.1,
  padding: [8, 12],
  glow: true,
  glowProps: {
    color: '#fff',
    scale: 1,
    blur: 70,
    opacity: 0.1,
    show: false,
    resist: 60,
    zIndex: 1,
  },
  highlightBackground: [255, 255, 255, 0.045],
  childrenEllipse: 2,
}

@view
class OraContent {
  render({ oraStore }) {
    return (
      <content $contentWithHeaderOpen={oraStore.focusedBar}>
        <Sidebar
          width={Constants.ORA_WIDTH}
          store={oraStore}
          oraStore={oraStore}
          listProps={{
            groupBy: 'category',
            virtualized: {
              measure: true,
            },
            itemProps,
          }}
        />
      </content>
    )
  }
  static style = {
    content: {
      position: 'absolute',
      top: Constants.ORA_HEADER_HEIGHT,
      left: 0,
      right: 0,
      bottom: 0,
      transition: `transform 100ms ease-in`,
    },
    contentWithHeaderOpen: {
      transform: {
        y: Constants.ORA_HEADER_HEIGHT_FULL - Constants.ORA_HEADER_HEIGHT,
      },
    },
  }
}

@view.provide({
  oraStore: OraStore,
})
@view
export default class OraPage {
  render({ oraStore }) {
    return (
      <UI.Theme name="dark">
        <ora
          $visible={!oraStore.state.hidden}
          ref={oraStore.ref('barRef').set}
          $$draggable
        >
          <OraBlur if={false} oraStore={oraStore} />
          <UI.Theme name="clear-dark">
            <OraHeader oraStore={oraStore} />
          </UI.Theme>
          <OraContent oraStore={oraStore} />
          <OraDrawer oraStore={oraStore} />
          <OraActionBar oraStore={oraStore} />
          <bottomBackground
            css={{
              background: Constants.ORA_BG_MAIN,
              position: 'absolute',
              left: -100,
              right: -100,
              bottom: -100,
              zIndex: -1,
              height: Constants.ACTION_BAR_HEIGHT + 100,
            }}
          />
        </ora>
      </UI.Theme>
    )
  }

  static style = {
    ora: {
      width: Constants.ORA_WIDTH,
      height: Constants.ORA_HEIGHT,
      background: Constants.ORA_BG,
      // border: [1, [255, 255, 255, 0.035]],
      boxShadow: [
        [0, 0, 10, [0, 0, 0, 0.5]],
        // ['inset', 0, 0, 120, [255, 255, 255, 0.053]],
      ],
      margin: 10,
      borderRadius: 10,
      overflow: 'hidden',
      transition: 'all ease-in 100ms',
      opacity: 0,
      transform: {
        x: 8,
      },
    },
    visible: {
      opacity: 1,
      transform: {
        x: 0,
      },
    },
  }
}
