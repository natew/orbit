import * as React from 'react'
import { view } from '@mcro/black'
import * as UI from '@mcro/ui'
import { throttle } from 'lodash'
import { ORA_BORDER_RADIUS, ORA_HEIGHT, ORA_WIDTH } from '~/constants'
import oraItems from './oraItems'

@view
export default class Ora extends React.Component {
  state = {
    lastIntersection: -1,
  }

  componentDidMount() {
    const update = lastIntersection => {
      if (this.state.lastIntersection !== lastIntersection) {
        this.setState({ lastIntersection })
      }
    }

    const { node, bounds } = this.props
    this.on(
      node,
      'scroll',
      throttle(() => {
        if (node.scrollTop < 200) {
          update(0)
        } else {
          const bottom = window.innerHeight + node.scrollTop
          for (let i = bounds.length - 1; i > -1; i--) {
            const bound = bounds[i]
            if (!bound) continue
            if (bound.top + window.innerHeight / 2 < bottom) {
              update(i)
              break
            }
          }
        }
      }, 100)
    )

    this.setState({ lastIntersection: 0 })
  }

  render() {
    const items = oraItems[this.state.lastIntersection]
    if (window.innerWidth < 800) {
      return null
    }
    return (
      <UI.Theme name="dark">
        <ora
          css={{
            position: 'fixed',
            top: 20,
            right: 20,
            width: ORA_WIDTH,
            height: ORA_HEIGHT,
            // borderRadius: 10,
            userSelect: 'none',
            background: [40, 40, 40, 0.9],
            borderRadius: ORA_BORDER_RADIUS,
            color: '#fff',
            zIndex: 10000,
            boxShadow: [
              '0 0 10px rgba(0,0,0,0.25)',
              'inset 0 0 100px 30px #252525',
            ],
          }}
        >
          <header css={{ padding: 10, opacity: 0.25 }}>
            <UI.Icon name="zoom" />
          </header>
          <content css={{ padding: 0 }}>
            <UI.List
              itemProps={{ padding: [10, 15], glow: true }}
              key={this.state.lastIntersection}
              groupKey="category"
              items={items}
            />
          </content>
        </ora>
      </UI.Theme>
    )
  }
}
