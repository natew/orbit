import React from 'react'
import { view } from '@jot/black'
import Button from './button'
import Grain from './grain'
import Title from './title'
import type { Color } from 'gloss'

export type Props = {
  title?: string,
  titleProps?: Object,
  children?: React$Children,
  sub?: boolean,
  collabsable: boolean,
  onSetCollapse: Function,
  padding?: number | Array<number>,
  margin?: number | Array<number>,
  maxHeight?: number,
  minHeight?: number,
  height?: number,
  scrollable?: boolean,
}

@view.ui
export default class Pane {
  static defaultProps = {
    collapsable: false,
    onSetCollapse: () => {},
  }

  state = {
    collapsed: false,
  }

  componentWillMount() {
    this.setCollapsed(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.setCollapsed(nextProps)
  }

  setCollapsed = ({ collapsed }) => {
    this.setState({ collapsed })
  }

  handleCollapse = (event: MouseEvent) => {
    if (this.props.collapsable) {
      const collapsed = !this.state.collapsed
      this.props.onSetCollapse(collapsed)
      this.setState({ collapsed })
    }
    if (this.props.onClick) {
      this.props.onClick(event)
    }
  }

  render({
    collapsable,
    title,
    titleProps,
    height,
    children,
    sub,
    maxHeight,
    minHeight,
    onSetCollapse,
    scrollable,
    collapsed: _collapsed,
    padding,
    margin,
    ...props
  }: Props) {
    const { collapsed } = this.state
    const collapseHeight = 27

    const titleElement = React.isValidElement(title)
      ? title
      : <Title
          if={title}
          $noCollapsable={!collapsable}
          collapsable={collapsable}
          collapsed={collapsed}
          onCollapse={this.handleCollapse}
          sub={sub}
          {...titleProps}
        >
          {title}
        </Title>

    return (
      <section
        $height={height}
        $maxHeight={collapsed ? collapseHeight : maxHeight || 'auto'}
        $minHeight={collapsed ? collapseHeight : minHeight}
      >
        {titleElement}
        <content $hide={collapsed} {...props}>
          {children}
        </content>
      </section>
    )
  }

  static style = {
    height: height => ({
      flex: 'auto',
      height,
    }),
    maxHeight: maxHeight => ({
      maxHeight,
    }),
    minHeight: minHeight => ({
      minHeight,
    }),
    hide: {
      display: 'none',
    },
    noCollapsable: {
      paddingLeft: 10,
    },
    content: {
      flex: 1,
      position: 'relative',
    },
  }

  static theme = {
    theme: ({ padding, margin, height }, context, theme) => ({
      content: {
        padding: padding === true ? 10 : padding,
        margin: margin === true ? 10 : margin,
      },
    }),
    maxHeight: ({ maxHeight }) => ({
      content: {
        maxHeight: maxHeight,
        overflowY: 'auto',
        flex: 1,
      },
    }),
    scrollable: {
      content: {
        overflowY: 'auto',
      },
    },
  }
}
