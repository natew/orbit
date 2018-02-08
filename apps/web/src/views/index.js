import * as React from 'react'
import * as UI from '@mcro/ui'

export const Title = props => {
  const minSize = 1.8
  const maxSize = 2.5
  const ogSize = 3.4 - props.children.length * 0.05
  const titleSize = Math.min(maxSize, Math.max(ogSize, minSize))
  return <UI.Title flex={1} fontWeight={800} size={titleSize} {...props} />
}

export const SubTitle = props => (
  <UI.Title
    fontWeight={400}
    color={[0, 0, 0, 0.4]}
    marginBottom={5}
    size={1.1}
    {...props}
  />
)

export const Link = props => (
  <UI.Text fontWeight={400} color="#8b2bec" display="inline" {...props} />
)
