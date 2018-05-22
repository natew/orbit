import * as EventKit from 'event-kit'
import * as Events from './events'
import ref_ from './ref'

export { Helpers } from './types'
export const { CompositeDisposable } = EventKit
export const { requestAnimationFrame, setTimeout, setInterval, on } = Events
export const ref = ref_

export const sleep = ms => new Promise(res => setTimeout(res, ms))

import { comparer } from 'mobx'
export const isEqual = comparer.structural

export type ReactionOptions = {
  fireImmediately?: boolean
  immediate?: boolean
  equals?: Function
  log?: boolean | 'state'
  delay?: number
  isIf?: boolean
  delayValue?: boolean
  onlyUpdateIfChanged?: boolean
  defaultValue?: any
}

export function getReactionOptions(userOptions?: ReactionOptions) {
  let options: ReactionOptions = {
    equals: comparer.structural,
  }
  if (options.immediate) {
    options.fireImmediately = true
    delete options.immediate
  }
  if (userOptions === true) {
    options.fireImmediately = true
  }
  if (userOptions instanceof Object) {
    options = { ...options, ...userOptions }
  }
  return options
}

export function watchModel(
  Model: any,
  where: Object,
  onChange: Function,
  options?,
) {
  const { interval = 1000 } = options || {}
  let setting
  let refreshInterval
  Model.findOne({ where }).then(first => {
    setting = first
    onChange(setting)
    refreshInterval = setInterval(async () => {
      const next = await Model.findOne({ where })
      if (Date.parse(next.updatedAt) === Date.parse(setting.updatedAt)) {
        return
      }
      setting = next
      onChange(setting)
    }, interval)
  })
  return {
    cancel: () => {
      clearInterval(refreshInterval)
    },
  }
}
