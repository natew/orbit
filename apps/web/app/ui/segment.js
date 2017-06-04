import React from 'react'
import { string, object } from 'prop-types'
import { view } from '~/helpers'
import Button from './button'
import { pickBy } from 'lodash'
import { Provider } from 'react-tunnel'
import type { Color } from 'gloss'

const notUndefined = x => typeof x !== 'undefined'

@view.ui
export default class Segment {
  props: {
    onChange?: Function,
    defaultActive?: number,
    onlyIcons?: boolean,
    size?: number,
    title?: string,
    stretch?: boolean,
    sync?: boolean,
    padded?: boolean,
    color: Color,
  }

  static defaultProps = {
    items: [],
    onChange: () => {},
  }

  state = {
    active: null,
  }

  select = active => {
    this.setState({ active })
    if (this.props.sync) {
      this.props.sync.set(active)
    }
  }

  get active() {
    const hasState = this.state.active !== null
    if (this.props.sync) {
      return this.props.sync.get()
    }
    return hasState ? this.state.active : this.props.defaultActive
  }

  render({
    items,
    onChange,
    defaultActive,
    onlyIcons,
    size,
    children,
    active,
    title,
    stretch,
    sync,
    padded,
    color,
    ...props
  }) {
    const curActive = typeof active === 'undefined' ? this.active : active
    let finalChildren = null

    if (children) {
      const realChildren = React.Children
        .map(children, _ => _)
        .filter(child => !!child)

      finalChildren = realChildren.map((child, i) => (
        <Provider
          key={i}
          provide={{
            ui: {
              ...this.context.ui,
              segment: {
                first: i === 0,
                last: i === realChildren.length - 1,
              },
            },
          }}
        >
          {() => child}
        </Provider>
      ))
    } else if (Array.isArray(items)) {
      finalChildren = items.map((seg, i) => {
        const { text, id, icon, ...segmentProps } = typeof seg === 'object'
          ? seg
          : { text: seg, id: seg }

        return (
          <Provider
            key={i}
            provide={{
              uiSegment: {
                first: i === 0,
                last: i === items.length - 1,
                index: i,
              },
            }}
          >
            <Button
              active={(id || icon) === curActive}
              icon={onlyIcons ? text : icon}
              iconSize={size}
              iconColor={color}
              onChange={() => {
                this.select(id)
                onChange(seg)
              }}
              {...segmentProps}
            >
              {!onlyIcons && text}
            </Button>
          </Provider>
        )
      })
    }

    return (
      <segment {...props}>
        <title if={title}>{title}</title>
        {finalChildren}
      </segment>
    )
  }

  static style = {
    segment: {
      pointerEvents: 'auto',
      flexFlow: 'row',
      alignItems: 'center',
      userSelect: 'none',
      flex: 1,
    },
    title: {
      margin: ['auto', 5],
      opacity: 0.8,
      fontSize: 11,
    },
  }

  static theme = {
    reverse: {
      segment: {
        flexFlow: 'row-reverse',
      },
    },
    padded: {
      segment: {
        margin: ['auto', 5],
      },
    },
    vertical: {
      segment: {
        flexFlow: 'column',
      },
    },
  }
}
