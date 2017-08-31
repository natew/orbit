// @flow
import { CompositeDisposable } from 'sb-event-kit'

export type Subscribable = {
  subscriptions: CompositeDisposable,
}

export default () => ({
  name: 'subscribable',
  once: true,
  onlyClass: true,
  decorator: (Klass: Class<any> | Function) => {
    if (Klass.prototype.subscriptions) {
      console.log('skip, already has subscriptions')
      return Klass
    }
    Object.defineProperty(Klass.prototype, 'subscriptions', {
      configurable: true,
      get() {
        if (!this.__subscriptions) {
          this.__subscriptions = new CompositeDisposable()
        }
        return this.__subscriptions
      },
    })
  },
  mixin: {
    componentWillUnmount() {
      this.subscriptions.dispose()
    },
  },
})
