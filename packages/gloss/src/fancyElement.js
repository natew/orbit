// @flow
import * as React from 'react'
import deepExtend from 'deep-extend'
import tags from 'html-tags'

const $ = '$'
const ogCreateElement: Function = React.createElement.bind(React)
const VALID_TAGS: { [string]: boolean } = tags.reduce(
  (acc, cur) => ({ ...acc, [cur]: true }),
  {}
)

const arrayOfObjectsToObject = (arr: Array<?Object>) => {
  let res = {}
  for (let i = 0; i < arr.length; i++) {
    if (!arr[i]) {
      continue
    }
    deepExtend(res, arr[i])
  }
  return res
}

// tags that are dangerous to use
const TAG_NAME_MAP = {
  title: 'div',
  body: 'div',
  meta: 'div',
  head: 'div',
}

// factory that returns fancyElement helper
export default function fancyElementFactory(Gloss: Gloss, styles?: Object) {
  const { baseStyles, options, css } = Gloss

  // Fast object reduce
  function objToCamel(style) {
    let newStyle = {}
    for (const name of Object.keys(style)) {
      if (name.indexOf('-')) {
        newStyle[Gloss.helpers.snakeToCamel(name)] = style[name]
      } else {
        newStyle[name] = style[name]
      }
    }
    return newStyle
  }

  return function fancyElement(
    type_: string | Function,
    props?: Object,
    ...children: Array<any>
  ) {
    let type = type_
    if (!type) {
      throw new Error(
        `Didn't get a valid type: ${type}, props: ${JSON.stringify(
          props
        )}, children: ${children ? children.toString() : children}`
      )
    }

    const propNames = props ? Object.keys(props) : null
    const isTag = typeof type === 'string'
    const name: string = !isTag ? `${type.name}` : type
    const finalProps = {}
    const finalStyles = []
    const { theme } = this
    const { glossUID } = this.constructor

    const addStyle = (obj, key, val, checkTheme): ?Object => {
      let style = obj[key]
      if (!style) {
        style = obj.getRule ? obj.getRule(key) : obj[key]
      }
      if (!style) {
        return null
      }
      // dynamic
      if (typeof style === 'function') {
        return css(style(val))
      } else {
        finalStyles.push(style)
      }
      if (checkTheme && theme) {
        const themeKey = `${key.replace(
          `--${glossUID}`,
          `--${this.themeKey}`
        )}--theme`
        const themeStyle = theme.getRule(themeKey)
        if (themeStyle) {
          finalStyles.push(themeStyle)
        }
      }
    }

    if (styles && name) {
      addStyle(styles, `${name}--${glossUID}`, null, true)
    }

    let style

    if (propNames) {
      for (const prop of propNames) {
        const val = props && props[prop]
        // ignore most falsy values (except 0)
        if (val === false || val === null || val === undefined) {
          continue
        }
        // style={}
        if (prop === 'style') {
          style = { ...style, ...val }
          continue
        }
        // css={}
        if (options.glossProp && prop === options.glossProp) {
          if (val && Object.keys(val).length) {
            // css={}
            const extraStyle = css(val, { snakeCase: false })
            style = { ...style, ...extraStyle }
          }
          continue
        }
        // tagName={}
        if (
          options.tagName &&
          prop === options.tagName &&
          isTag &&
          typeof val === 'string'
        ) {
          type = val
          continue
        }
        // ensure before tagName={} so it passes tagName down
        if (prop[0] !== $) {
          // pass props down if not glossProp style prop
          finalProps[prop] = val
          continue
        }
        // $$style={}
        if (baseStyles) {
          const isParentStyle = prop[1] === $
          if (isParentStyle) {
            const inlineStyle = addStyle(styles, prop.slice(2), val, false)
            if (inlineStyle) {
              style = { ...style, ...inlineStyle }
            }
            continue
          }
        }
        // $style={}
        if (styles) {
          const inlineStyle = addStyle(
            styles,
            `${prop.slice(1)}--${glossUID}`,
            val,
            true
          )
          if (inlineStyle) {
            style = { ...style, ...objToCamel(inlineStyle) }
          }
        }
      }
    }

    if (style) {
      finalProps.style = style
    }

    // styles => props
    if (finalStyles.length) {
      if (isTag) {
        // tags get className
        finalProps.className = finalStyles
          .map(x => x.className || x.selectorText.slice(1))
          .join(' ')

        // keep original finalStyles
        if (props && props.className) {
          if (typeof props.className === 'string') {
            finalProps.className += ` ${props.className}`
          }
        }
      } else {
        // children get a style prop
        if (props) {
          finalProps.style = objToCamel(
            arrayOfObjectsToObject([
              ...finalStyles.map(style => style && style.style),
              finalProps.style,
            ])
          )
        }
      }
    }

    if (isTag) {
      if (!VALID_TAGS[type]) {
        finalProps['data-tagname'] = type
        type = 'div'
      }
      type = TAG_NAME_MAP[type] || type
    }

    return ogCreateElement(type, finalProps, ...children)
  }
}
