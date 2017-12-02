import * as React from 'react'
import { view } from '@mcro/black'
import Text from './text'

@view.ui
export default class Separator {
  render({ after, children, ...props }) {
    return (
      <separator {...props}>
        <Text $content size={0.9}>
          {children}
        </Text>
        <after if={after}>{after}</after>
      </separator>
    )
  }

  static style = {
    separator: {
      fontWeight: 500,
      padding: [12, 10, 3],
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: [1, [0, 0, 0, 0.2]],
      textAlign: 'left',
      opacity: 0.4,
      userSelect: 'none',
      position: 'relative',
      flexFlow: 'row',
    },
    content: {
      pointerEvents: 'none',
      flex: 1,
    },
  }
}
