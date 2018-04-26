import * as React from 'react'
import * as UI from '@mcro/ui'

export * from './roundButton'

export const highlightColor = UI.color('#696549')

export const Circle = props => (
  <circle
    css={{
      display: 'inline-block',
      borderRadius: 100,
      width: 18,
      height: 18,
      lineHeight: '18px',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      // background: .alpha(0.75),
      // border: [1, highlightColor],
      boxShadow: [[0, 0, 0, 0.5, highlightColor]],
      color: highlightColor,
      fontWeight: 500,
      fontSize: 12,
      margin: [-2, 4, -2, -2],
    }}
    {...props}
  />
)

export const Title = ({ center, children, ...props }) => (
  <UI.Title
    size={1.4}
    fontWeight={300}
    css={{
      padding: [0, 15, 2],
      alignItems: center ? 'center' : 'flex-start',
    }}
    color="#000"
    {...props}
  >
    {children}
  </UI.Title>
)

export const SubTitle = props => (
  <UI.Text
    css={{
      fontWeight: 300,
      fontSize: 16,
      alignItems: 'center',
      flexFlow: 'row',
      padding: [5, 15, 0],
      opacity: 0.5,
      marginBottom: 5,
      color: highlightColor,
    }}
    {...props}
  />
)

export const Link = props => (
  <UI.Text fontWeight={400} color="#8b2bec" display="inline" {...props} />
)
