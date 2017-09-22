import React from 'react'
import SizedSurface from './sizedSurface'
import injectTheme from './helpers/injectTheme'
import { inject } from '@mcro/react-tunnel'
import { view } from '@mcro/black'

@inject(context => ({ uiContext: context.uiContext }))
@injectTheme
@view.ui
export default class Button extends React.PureComponent {
  render({
    uiContext,
    badge,
    children,
    theme,
    chromeless,
    type,
    glowProps,
    badgeProps,
    ...props
  }) {
    let onClick = props.onClick

    // patch until figure out why this doesnt trigger onSubmit
    if (type === 'submit') {
      const ogOnClick = onClick
      onClick = function(...args) {
        uiContext.form.submit()
        return (ogOnClick && ogOnClick(...args)) || null
      }
    }
    return (
      <SizedSurface
        tagName="button"
        type={type}
        clickable
        hoverable
        borderRadius
        sizeFont
        sizePadding={1.2}
        sizeRadius
        sizeHeight
        sizeIcon={1.1}
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
        }}
        glowProps={{
          scale: 1.8,
          draggable: false,
          show: false,
          ...glowProps,
          ...(theme && theme.glow),
        }}
        {...props}
        onClick={onClick}
        noElement
        after={
          <badge
            if={badge}
            $badgeSize={props.size === true ? 1 : props.size || 1}
            {...badgeProps}
          >
            <contents>{badge}</contents>
          </badge>
        }
      >
        {children}
      </SizedSurface>
    )
  }

  static style = {
    badge: {
      position: 'absolute',
      top: '23%',
      right: '30%',
      textAlign: 'right',
      alignSelf: 'flex-end',
      textShadow: '1px 1px 0 rgba(0,0,0,0.15)',
      lineHeight: '1px',
      fontWeight: 600,
      borderRadius: 120000,
      justifyContent: 'center',
      background: 'linear-gradient(left, red, purple)',
      color: '#fff',
      overflow: 'hidden',
      pointerEvents: 'none',
      border: [8, '#fff'],
      zIndex: 100000000,
      transform: {
        scale: 0.14,
        x: '345%',
        y: 0,
        z: 0,
      },
    },
    badgeSize: size => ({
      minWidth: size * 90 + 2,
      height: size * 90 + 2,
      fontSize: size * 60,
      marginTop: -((size * 90 + 2) / 2),
    }),
    contents: {
      alignItems: 'center',
      justifyContent: 'center',
      margin: [0, 18],
    },
  }
}

Button.acceptsHovered = true
