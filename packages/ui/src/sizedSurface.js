// @flow
import React from 'react'
import Surface from './surface'

const LINE_HEIGHT = 30
const adj = x => (x === true ? 1 : x)

export default class SizedSurface extends React.Component {
  static defaultProps = {
    size: 1,
    sizeHeight: true,
  }

  render() {
    const { props } = this
    const {
      sizeHeight,
      sizeMargin,
      sizeRadius,
      sizeFont,
      sizePadding,
      ...rest
    } = props

    // sizes
    const height = sizeHeight && props.size * LINE_HEIGHT * adj(sizeHeight)
    const fontSize = sizeFont && height * 0.45 * adj(sizeFont)
    const borderRadius = sizeRadius && height / 3.4 * adj(sizeRadius)
    const padWithWrap = props.wrapElement ? 0 : height / 3.5
    const padding = sizePadding && [0, padWithWrap * adj(sizePadding)]
    const margin = sizeMargin && adj(sizeMargin) * 0.25

    const pass = {
      borderRadius,
      height,
      fontSize,
      padding,
      margin,
    }

    return <Surface {...pass} {...rest} />
  }
}
