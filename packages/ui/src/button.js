import React from 'react'
import SizedSurface from './sizedSurface'
import injectTheme from './helpers/injectTheme'
import { inject } from 'react-tunnel'

const Button = inject(context => ({ uiContext: context.uiContext }))(
  injectTheme(
    ({
      uiContext,
      badge,
      children,
      theme,
      chromeless,
      type,
      glowProps,
      css,
      ...props
    }) => {
      return (
        <SizedSurface
          tagName="button"
          type={type}
          clickable
          hoverable
          sizeRadius
          sizeFont
          sizeHeight
          sizePadding={1.1}
          borderWidth={1}
          glint={!chromeless}
          chromeless={chromeless}
          row
          align="center"
          justify="center"
          glow
          css={{
            flexWrap: 'nowrap',
            whiteSpace: 'pre',
            ...css,
          }}
          glowProps={{
            scale: 2,
            draggable: false,
            ...glowProps,
          }}
          {...props}
          noElement
        >
          {children}
          {badge &&
            <badge>
              {badge}
            </badge>}
        </SizedSurface>
      )
    }
  )
)

Button.acceptsHovered = true

export default Button
