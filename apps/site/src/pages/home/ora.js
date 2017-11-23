import * as React from 'react'
import { view } from '@mcro/black'
import * as UI from '@mcro/ui'
import * as Constants from '~/constants'
import oraItems from './oraItems'

@view
export default class Ora extends React.Component {
  render({ style, homeStore }) {
    const { activeKey } = homeStore
    const items = oraItems[activeKey]
    if (window.innerWidth < Constants.smallSize) {
      return null
    }
    return (
      <ora style={style}>
        <UI.Theme name="dark">
          <header>
            <UI.Icon name="zoom" />
          </header>
          <content>
            <UI.List
              itemProps={{ padding: [10, 15], glow: true, size: 1.15 }}
              key={activeKey}
              groupBy="category"
              items={items}
            />
          </content>
        </UI.Theme>
      </ora>
    )
  }
  static style = {
    ora: {
      position: 'sticky',
      margin: [0, 0, -Constants.ORA_HEIGHT, 800],
      top: Constants.ORA_TOP_PAD,
      width: Constants.ORA_WIDTH,
      height: Constants.ORA_HEIGHT,
      borderRadius: Constants.ORA_BORDER_RADIUS,
      userSelect: 'none',
      background: [40, 40, 40, 0.6],
      border: [4, 'transparent'],
      color: '#fff',
      zIndex: 10000,
      boxShadow: ['0 10px 50px rgba(0,0,0,0.29)'],
    },
    header: { padding: 10, opacity: 0.25 },
    content: { padding: 0 },
  }
}
