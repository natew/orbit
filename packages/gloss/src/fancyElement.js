// @flow
import * as React from 'react'
import deepExtend from 'deep-extend'
import JSS from './stylesheet'
import tags from 'html-tags'

if (module.hot) {
  module.hot.accept(_ => _)
}

const VALID_TAGS: { [string]: boolean } = tags.reduce(
  (acc, cur) => ({ ...acc, [cur]: true }),
  {}
)
const IS_PROD = process.env.NODE_ENV === 'production'

const arrayOfObjectsToObject = (arr: Array<Object>) => {
  let res = {}
  for (let i = 0; i < arr.length; i++) {
    deepExtend(res, arr[i])
  }
  return res
}
const ogCreateElement: Function = React.createElement.bind(React)
const TAG_NAME_MAP = {
  title: 'div',
  body: 'div',
  meta: 'div',
  head: 'div',
}
const $ = '$'
const dynamicCache = {}

// factory that returns fancyElement helper
export default function fancyElementFactory(Gloss: Gloss, styles?: Object) {
  const { baseStyles, options, css } = Gloss

  const getDynamicStyle = styles => {
    const key = JSON.stringify(styles)
    if (dynamicCache[key]) {
      return dynamicCache[key]
    }
    const niceStyles = css(styles)
    dynamicCache[key] = JSS.createRule(niceStyles)
    return dynamicCache[key]
  }

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

    const addStyle = (obj, key, val, checkTheme) => {
      const style = obj.getRule ? obj.getRule(key) : obj[key]
      if (!style) {
        return
      }
      // dynamic
      if (typeof style === 'function') {
        finalStyles.push(getDynamicStyle(style(val)))
      } else {
        finalStyles.push(style)
      }
      if (checkTheme && theme) {
        const themeKey = `${key}--theme`
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
        if (prop === 'style') {
          style = { ...style, ...val }
          continue
        }
        // non-style actions
        if (options.glossProp && prop === options.glossProp) {
          if (Object.keys(val).length) {
            // css={}
            const extraStyle = css(val)
            style = { ...style, ...extraStyle }
          }
          continue
        }
        if (
          options.tagName &&
          prop === options.tagName &&
          isTag &&
          typeof val === 'string'
        ) {
          // tagName={}
          type = val
          continue
        }
        if (prop[0] !== $) {
          // pass props down if not glossProp style prop
          finalProps[prop] = val
          continue
        }
        // style actions
        if (val === false || val === null || val === undefined) {
          // ignore most falsy values (except 0)
          continue
        }
        if (baseStyles) {
          // $$style
          const isParentStyle = prop[1] === $
          if (isParentStyle) {
            addStyle(baseStyles, prop.slice(2), val, false)
            continue
          }
        }
        if (styles) {
          // $style
          addStyle(styles, `${prop.slice(1)}--${glossUID}`, val, true)
        }
      }
    }

    finalProps.style = style

    // styles => props
    if (finalStyles.length) {
      if (isTag) {
        const css = (...styles) =>
          styles.map(x => x.className || x.selectorText.slice(1)).join(' ')

        // tags get className
        if (IS_PROD) {
          finalProps.className = css(...finalStyles)
        } else {
          try {
            finalProps.className = css(...finalStyles)
          } catch (e) {
            console.error('Error applying style to', name, finalStyles, this)
          }
        }

        // keep original finalStyles
        if (props && props.className) {
          if (typeof props.className === 'string') {
            finalProps.className += ` ${props.className}`
          }
        }
      } else {
        // children get a style prop
        if (props) {
          finalProps.style = arrayOfObjectsToObject([
            finalProps.style,
            ...finalStyles.map(style => style && objToCamel(style.style)),
          ])
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
