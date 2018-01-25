import * as React from 'react'
import { view } from '@mcro/black'
import * as UI from '@mcro/ui'
import OraStore from './oraStore'
import Sidebar from './panes/sidebar'
import OraHeader from './oraHeader'
import OraDrawer from './oraDrawer'
import OraActionBar from './oraActionBar'
import * as Constants from '~/constants'
import { OS } from '~/helpers'

if (module.hot) {
  module.hot.accept('./oraStore')
}

export const LogoIcon = ({ fill, ...props }) => (
  <svg viewBox="0 0 396 396" {...props}>
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="Custom-Preset" transform="translate(-58.000000, -58.000000)">
        <path
          d="M400.795627,309.284347 C406.953875,292.576393 410.315609,274.52289 410.315609,255.687029 C410.315609,169.82373 340.458986,100.217774 254.286475,100.217774 C168.113963,100.217774 98.25734,169.82373 98.25734,255.687029 C98.25734,341.550328 168.113963,411.156285 254.286475,411.156285 C260.969181,411.156285 267.553763,410.737671 274.015249,409.925324 C264.174408,400.932306 256.552412,389.583576 252.057174,376.780341 C185.955905,375.595706 132.737045,321.834032 132.737045,255.687029 C132.737045,188.798015 187.156578,134.573755 254.286475,134.573755 C321.416371,134.573755 375.835904,188.798015 375.835904,255.687029 C375.835904,264.319315 374.929552,272.740672 373.206497,280.86177 C384.57776,287.945949 394.075845,297.71962 400.795627,309.284347 Z"
          id="border"
          fill={fill}
        />
        <g
          id="Circle"
          transform="translate(258.779071, 274.755860) rotate(-3.000000) translate(-258.779071, -274.755860) translate(133.279071, 134.755860)"
        >
          <path
            d="M20.7356311,192.264605 C8.11631429,172.857679 0.769499347,149.554459 0.769499347,124.396002 C0.769499347,56.0237732 54.9924616,0.597130449 121.879875,0.597130449 C169.338736,0.597130449 210.421833,28.5009965 230.284218,69.1342417 C208.552365,35.99269 171.573707,14.1769504 129.610363,14.1769504 C62.7229495,14.1769504 8.49998727,69.6035931 8.49998727,137.975822 C8.49998727,157.449409 12.8985996,175.87284 20.7356311,192.264605 Z"
            id="Path"
            fill="#000000"
            opacity="0.0600000024"
          />
          <ellipse
            id="Path"
            fill={fill}
            cx="191.940484"
            cy="221.384129"
            rx="58.1147622"
            ry="58.6059326"
          />
        </g>
      </g>
    </g>
  </svg>
)

const listProps = {
  virtualized: false,
  itemProps: {
    size: 1.05,
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
    secondaryProps: {
      alpha: 0.4,
    },
    highlightBackground: [255, 255, 255, 0.075],
    childrenEllipse: 2,
  },
  groupBy: 'category',
  onScroll: () => {
    // TODO clear all popovers
    OS.send('peek-target', null)
  },
}

@view.attach('oraStore')
@view
class OraMainContent {
  shouldMeasure = () => {
    const { oraStore } = this.props
    return oraStore.ui.height !== oraStore.ui.lastHeight
  }

  render({ oraStore }) {
    return (
      <content $contentWithHeaderOpen={oraStore.ui.barFocused}>
        <Sidebar
          width={Constants.ORA_WIDTH}
          store={oraStore}
          oraStore={oraStore}
          shouldMeasure={this.shouldMeasure}
          listProps={listProps}
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
        y: 0, //Constants.ORA_HEADER_HEIGHT_FULL - Constants.ORA_HEADER_HEIGHT,
      },
    },
  }
}

const OraContent = () => (
  <React.Fragment>
    <OraHeader />
    <OraMainContent />
    <OraDrawer />
    <OraActionBar />
  </React.Fragment>
)

@view.provide({
  oraStore: OraStore,
})
@view
export default class OraPage {
  render({ oraStore }) {
    const { showOra } = oraStore.ui
    return (
      <oraContainer>
        <UI.Theme name="dark">
          <ora
            $visible={showOra}
            $oraFocused={oraStore.ui.barFocused}
            ref={oraStore.ref('barRef').set}
            $$draggable
            css={{
              height: oraStore.ui.height,
              boxShadow:
                oraStore.ui.height !== 40
                  ? [
                      [0, 0, 5, 0, [0, 0, 0, 0.15]],
                      ['inset', 0, 0, 0, 0.5, [255, 255, 255, 0.2]],
                    ]
                  : [['inset', 0, 0, 0, 0.5, [255, 255, 255, 0.2]]],
            }}
          >
            <OraContent />
          </ora>
        </UI.Theme>
      </oraContainer>
    )
  }

  static style = {
    oraContainer: {
      width: Constants.ORA_WIDTH + Constants.ORA_PAD,
      position: 'relative',
      overflow: 'hidden',
    },
    ora: {
      pointerEvents: 'none !important',
      // height: Constants.ORA_HEIGHT,
      background: Constants.ORA_BG,
      // border: [1, [255, 255, 255, 0.035]],
      margin: 5,
      borderRadius: 10,
      overflow: 'hidden',
      transition: 'all ease-in 120ms',
      opacity: 0,
      transform: {
        x: Constants.ORA_WIDTH + Constants.ORA_PAD,
      },
    },
    oraFocused: {
      background: Constants.ORA_BG_FOCUSED,
    },
    visible: {
      pointerEvents: 'auto !important',
      opacity: 1,
      transform: {
        x: 0,
      },
    },
    icon: {
      position: 'absolute',
      opacity: 0,
    },
    show: {
      opacity: 0.8,
    },
  }
}
