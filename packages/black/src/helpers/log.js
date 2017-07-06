// @flow
// helper that logs functions, works as decorator or plain

// Takes any string and converts it into a #RRGGBB color.
class StringToColor {
  stringToColorHash = {}
  nextVeryDifferntColorIdx = 0
  veryDifferentColors = [
    '#b19cd9',
    '#d9b19c',
    '#9cc4d9',
    '#c4d99c',
    '#87d086',
    '#d08687',
    '#8687d0',
    '#cf86d0',
    '#d0cf86',
    '#64cbcb',
    '#cb9864',
    '#cb6498',
    '#cb6464',
    '#ecc481',
    '#81a9ec',
    '#dfec81',
    '#81ecc4',
    '#c481ec',
  ]
  getColor(str) {
    if (!this.stringToColorHash[str]) {
      this.stringToColorHash[str] = this.veryDifferentColors[
        this.nextVeryDifferntColorIdx++
      ]
    }
    return this.stringToColorHash[str]
  }
}

const Color = new StringToColor()

function cutoff(thing: string) {
  if (thing.length > 150) {
    return thing.slice(0, 150) + '...'
  }
  return thing
}

function prettyPrint(thing: any) {
  if (Array.isArray(thing)) {
    return thing.map(prettyPrint)
  }
  if (typeof thing === 'object') {
    if (!thing) {
      return 'null'
    }
    try {
      return cutoff(JSON.stringify(thing, 0, 2))
    } catch (e) {
      return thing
    }
  } else if (typeof thing === 'undefined') {
    return 'undefined'
  } else {
    return thing
  }
}

export default function log(...args) {
  const [target, key, descriptor] = args

  const logger = (...things) => {
    console.log(
      `%c${things.map(prettyPrint).join(' ')}`,
      `background: ${Color.getColor(things[0].toString())}`
    )
  }

  if (
    args.length === 3 &&
    typeof target === 'object' &&
    typeof key === 'string' &&
    typeof descriptor === 'object'
  ) {
    // decorator
    const ogInit = descriptor.initializer
    descriptor.initializer = function() {
      return wrapLogger(ogInit.call(this), target, key)
    }
    return descriptor
  } else if (args.length === 1 && typeof args[0] === 'function') {
    // regular fn
    const [wrapFn] = args
    logger(wrapFn)
    return wrapLogger(wrapFn)
  }

  logger(...args)

  // pass through
  if (args.length === 1) {
    return args[0]
  }
}

function wrapLogger(wrapFn: Function, parent, name?: string) {
  const parentName = parent ? parent.name || parent.constructor.name : ''
  const methodName = wrapFn.name || name
  const color = Color.getColor(`${parentName}${methodName}`)

  return function(...args) {
    const result = wrapFn.call(this, ...args)
    const state =
      this &&
      this.state &&
      Object.keys(this.state).reduce(
        (acc, key, i) =>
          ` | ${key.slice(0, 9).padEnd(10)}: ${`${this.state[key]}`
            .slice(0, 9)
            .padEnd(10)}${i % 3 === 0 ? '\n' : ''}${acc}`,
        ''
      )
    console.log(
      `%c${parent ? `${parentName}.` : ''}${methodName}(${args.join(
        ','
      )}) => ${result}\nSTATE:\n${state}`,
      `color: ${color}`
    )
    return result
  }
}

log.debug = true
log.filter = false && /^(CommanderStore|Document)/
