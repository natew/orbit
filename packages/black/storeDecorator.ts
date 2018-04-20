import decor from '@mcro/decor'
import hydratable from '@mcro/decor/es6/plugins/core/hydratable'
import emittable from '@mcro/decor/es6/plugins/core/emittable'
import automagical from '@mcro/automagical'
import subscribable from '@mcro/decor/es6/plugins/react/subscribable'
import helpers from '@mcro/decor/es6/plugins/mobx/helpers'

export const storeDecorator = decor([
  subscribable,
  helpers,
  emittable,
  automagical,
  hydratable,
])

export const storeOptions = {
  storeDecorator,
  onStoreMount(_, store, props) {
    if (store.automagic) {
      store.automagic()
    }
    if (store.willMount) {
      store.willMount.call(store, props)
    }
  },
  onStoreUnmount(store) {
    if (store.willUnmount) {
      store.willUnmount(store)
    }
    if (store.subscriptions) {
      store.subscriptions.dispose()
    }
  },
}

export function store(Store) {
  const DecoratedStore = storeDecorator(Store)
  const ProxyStore = function(...args) {
    const store = new DecoratedStore(...args)
    storeOptions.onStoreMount(Store.constructor.name, store, args[0])
    return store
  }
  // copy statics
  const statics = Object.keys(Store)
  if (statics.length) {
    for (const key of statics) {
      ProxyStore[key] = Store[key]
    }
  }
  return ProxyStore
}