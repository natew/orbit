import React from 'react'
import { view, observable } from '~/helpers'
import Router from '~/router'

@view
export default class Link {
  @observable isActive = false

  componentDidMount() {
    this.watch(() => {
      const isActive =
        Router.path === this.props.to || Router.path === this.props.match
      this.ref('isActive').set(isActive)
    })
  }

  onClick = (e: Event) => {
    e.preventDefault()
    Router.go(this.props.to)
    if (this.props.onClick) {
      this.props.onClick(e)
    }
  }

  render({ to, match, highlight, active, ...props }) {
    return (
      <a
        href={to}
        onDragStart={e => e.preventDefault()}
        onClick={this.onClick}
        {...props}
        $active={this.isActive}
      />
    )
  }

  static style = {
    a: {
      cursor: 'pointer',
    },
  }

  static theme = {
    active: ({ active }) => ({ active }),
  }
}
