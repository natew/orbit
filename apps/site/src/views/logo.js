import * as React from 'react'
import SVGInline from 'react-svg-inline'
import LogoTextSVG from '~/../public/orbit.svg'
import LogoIconSVG from '~/../public/mark.svg'

const naturalWidth = 425
const naturalHeight = 142

export const LogoText = props => (
  <SVGInline cleanup svg={LogoTextSVG} width={`${naturalWidth}px`} {...props} />
)

const iconSize = 0.5
const markWidth = 177
const markHeight = 357
export const LogoIcon = props => (
  <SVGInline
    svg={LogoIconSVG}
    width={`${markWidth}px`}
    height={`${markHeight}px`}
    {...props}
  />
)

export default ({ iconColor = '#000', color = '#000', size = 1, ...props }) => {
  const css = {
    transformOrigin: 'top left',
    transform: { scale: size },
    width: naturalWidth * size,
    height: naturalHeight * size,
  }
  const iSize = iconSize * size * 0.8
  const iWidth = markWidth * iSize
  const iHeight = markHeight * iSize
  return (
    <logos
      css={{
        alignItems: 'center',
        flexFlow: 'row',
      }}
      {...props}
    >
      <LogoIcon
        css={{
          transformOrigin: 'top left',
          transform: { scale: iSize },
          width: iWidth,
          height: iHeight,
          margin: [0, 50 * iSize, 0, -40 * iSize],
        }}
      />
      <LogoText css={css} fill={color} />
    </logos>
  )
}
