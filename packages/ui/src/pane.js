// @flow
import * as React from 'react'
import { view } from '@mcro/black'
import Title from './title'
import type { Color } from '@mcro/gloss'

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
  transparent?: boolean,
  shadow?: boolean,
  background?: Color,
}

type State = {
  collapsed: boolean,
}

@view.ui
export default class Pane extends React.PureComponent<Props, State> {
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
    shadow,
    background,
    transparent,
    ...props
  }: Props) {
    const { collapsed } = this.state
    const collapseHeight = 27

    return (
      <section
        $height={height}
        $maxHeight={collapsed ? collapseHeight : maxHeight || 'auto'}
        $minHeight={collapsed ? collapseHeight : minHeight}
      >
        <Title
          if={title}
          $noCollapsable={!collapsable}
          collapsable={collapsable}
          collapsed={collapsed}
          onCollapse={this.handleCollapse}
          sub={sub}
          transparent={transparent}
          {...titleProps}
        >
          {title}
        </Title>
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

  static theme = (props, theme) => {
    const contentMaxHeightStyles = props.maxHeight && {
      maxHeight: props.maxHeight,
      overflowY: 'auto',
      flex: 1,
    }

    return {
      section: {
        background: props.background,
        boxShadow: props.shadow && '0 0 70px rgba(0,0,0,0.2)',
        flex: props.scrollable ? 1 : null,
      },
      content: {
        overflowY: props.scrollable ? 'auto' : false,
        padding: props.padding === true ? 8 : props.padding,
        margin: props.margin === true ? 8 : props.margin,
        ...contentMaxHeightStyles,
      },
    }
  }
}
