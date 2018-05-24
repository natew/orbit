import {
  getReactionOptions,
  setInterval,
  setTimeout,
  on,
  ref,
} from '@mcro/helpers'
import { autorun, reaction } from 'mobx'

// subscribe-aware helpers
export function watch(fn, userOptions) {
  const runner = autorun(fn.bind(this), getReactionOptions(userOptions))
  this.subscriptions.add(runner)
  return runner
}

export function react(fn, onReact, userOptions) {
  const dispose = reaction(
    fn,
    onReact.bind(this),
    // @ts-ignore
    getReactionOptions(userOptions),
  )
  this.subscriptions.add(dispose)
  return dispose
}

export function reactable() {
  return {
    name: 'mobx-reactable',
    once: true,
    onlyClass: true,
    decorator: Klass => {
      Object.assign(Klass.prototype, {
        ref,
        on,
        setInterval,
        setTimeout,
        watch,
        react,
      })
    },
  }
}
