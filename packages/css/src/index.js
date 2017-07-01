// @flow
import { colorToString, isColorLike } from './helpers'
import type { Transform } from './types'

// exports
export type { Transform, Color } from './types'
export * from './helpers'

const COLOR_KEYS = new Set(['color', 'backgroundColor', 'borderColor'])
const TRANSFORM_KEYS_MAP = {
  x: 'translateX',
  y: 'translateY',
  z: 'translateZ',
  dropShadow: 'drop-shadow',
}

const COMMA_JOINED = {
  boxShadow: true,
  transition: true,
}

const SHORTHANDS = {
  borderLeftRadius: ['borderTopLeftRadius', 'borderBottomLeftRadius'],
  borderRightRadius: ['borderTopRightRadius', 'borderBottomRightRadius'],
  borderBottomRadius: ['borderBottomLeftRadius', 'borderBottomRightRadius'],
  borderTopRadius: ['borderTopRightRadius', 'borderTopLeftRadius'],
}

const FALSE_VALUES = {
  background: 'transparent',
  backgroundColor: 'transparent',
  borderColor: 'transparent',
}

const BORDER_KEY = {
  border: true,
  borderLeft: true,
  borderRight: true,
  borderBottom: true,
  borderTop: true,
}

// helpers
const px = (x: number | string) => (/px$/.test(`${x}`) ? x : `${x}px`)
const isFloat = n => n === +n && n !== (n | 0)

// style transform creator
export default function motionStyle(options: Object = {}) {
  const isColor = color => isColorLike(color, options)
  const toColor = color => colorToString(color, options)

  const OBJECT_TRANSFORM = {
    textShadow: ({ x, y, blur, color }) =>
      `${px(x)} ${px(y)} ${px(blur)} ${toColor(color)}`,
    boxShadow: v =>
      v.inset || v.x || v.y || v.blur || v.spread || v.color
        ? `${v.inset ? 'inset' : ''} ${px(v.x)} ${px(v.y)} ${px(v.blur)} ${px(
            v.spread
          )} ${toColor(v.color)}`
        : toColor(v),
    background: v =>
      isColor(v)
        ? toColor(v)
        : `${toColor(v.color)} ${v.image || ''} ${(v.position
            ? v.position.join(' ')
            : v.position) || ''} ${v.repeat || ''}`,
  }

  function processArrayItem(key: string, val: any, level) {
    // recurse
    if (isColor(val)) {
      return toColor(val)
    }
    if (Array.isArray(val)) {
      return processArray(key, val, ++level)
    }
    return typeof val === 'number' ? `${val}px` : val
  }

  function processArray(
    key: string,
    array: Array<number | string>,
    level = 0
  ): string {
    if (key === 'background') {
      if (isColor(array)) {
        return toColor(array)
      }
    }
    // solid default option for borders
    if (BORDER_KEY[key] && array.length === 2) {
      array.push('solid')
    }
    return array
      .map(val => processArrayItem(key, val))
      .join(level === 0 && COMMA_JOINED[key] ? ', ' : ' ')
  }

  function objectValue(key: string, value: any) {
    if (Array.isArray(value)) {
      return processArray(key, value)
    }
    if (OBJECT_TRANSFORM[key]) {
      return OBJECT_TRANSFORM[key](value)
    }
    if (isFloat(value)) {
      return value
    }
    if (key === 'scale' || key === 'grayscale' || key === 'brightness') {
      return value
    }
    if (typeof value === 'number') {
      return `${value}px`
    }
    return value
  }

  function processObject(key: string, object: Object): string {
    if (
      key === 'background' ||
      key === 'color' ||
      key === 'borderColor' ||
      key === 'backgroundColor'
    ) {
      if (isColor(object)) {
        return toColor(object)
      }
    }
    const toReturn = []
    for (const subKey in object) {
      if (!object.hasOwnProperty(subKey)) {
        continue
      }
      let value = object[subKey]
      value = objectValue(subKey, value)
      toReturn.push(`${TRANSFORM_KEYS_MAP[subKey] || subKey}(${value})`)
    }
    return toReturn.join(' ')
  }

  // style transformer
  function processStyles(styles: Object, errorMessage?: string): Object {
    const toReturn = {}
    for (let key in styles) {
      if (!styles.hasOwnProperty(key)) {
        continue
      }

      let value = styles[key]
      let valueType = typeof value

      // get real values
      if (valueType === false) {
        value === FALSE_VALUES[key]
        valueType = typeof value
      }

      // simple syles
      if (valueType === 'undefined' || value === null || value === false) {
        continue
      }

      let respond
      const firstChar = key.substr(0, 1)

      if (valueType === 'string' || valueType === 'number') {
        toReturn[key] = value
        respond = true
      } else if (COLOR_KEYS.has(key)) {
        toReturn[key] = toColor(value)
        respond = true
      } else if (Array.isArray(value)) {
        toReturn[key] = processArray(key, value)
        respond = true
      } else if (firstChar === '&' || firstChar === '@') {
        // recurse into psuedo or media query
        toReturn[key] = processStyles(value, errorMessage)
        respond = true
      } else if (valueType === 'object') {
        toReturn[key] = processObject(key, value)
        respond = true
      }

      // shorthands
      if (SHORTHANDS[key]) {
        key = SHORTHANDS[key]
        if (Array.isArray(key)) {
          for (const k of key) {
            toReturn[k] = value
          }
        }
      }

      if (respond) {
        continue
      }

      throw new Error(
        `${errorMessage}: Invalid style value for ${key}: ${JSON.stringify(
          value
        )}`
      )
    }

    return toReturn
  }

  // expose helpers
  processStyles.helpers = {
    toColor,
    isColor,
    processArray,
    processObject,
  }

  return processStyles
}
