import * as React from 'react'
import * as Mobx from 'mobx'
import { pickBy, difference, isEqual } from 'lodash'
import hoistStatics from 'hoist-non-react-statics'
import { object } from 'prop-types'
import global from 'global'

// keep action out of class directly because of hmr bug
const updateProps = Mobx.action('updateProps', (props, nextProps) => {
  const curPropKeys = Object.keys(props)
  const nextPropsKeys = Object.keys(nextProps)
  // change granular so reactions are granular
  for (const prop of nextPropsKeys) {
    if (!isEqual(props[prop], nextProps[prop])) {
      props[prop] = nextProps[prop]
    }
  }
  // remove
  for (const extraProp of difference(curPropKeys, nextPropsKeys)) {
    props[extraProp] = undefined
  }
})

export function storeProvidable(options, Helpers) {
  return {
    name: 'store-providable',
    once: true,
    onlyClass: true,
    decorator: (Klass, opts = {}) => {
      const allStores = opts.stores || options.stores
      const context = opts.context || options.context
      const storeDecorator = opts.storeDecorator || options.storeDecorator

      if (!allStores) {
        return Klass
      }

      // see setupStores()
      let Stores

      function decorateStores() {
        Stores = allStores
        if (storeDecorator && allStores) {
          for (const key of Object.keys(allStores)) {
            Stores[key] = storeDecorator(allStores[key])
          }
        }
      }

      decorateStores()

      // return HoC
      class StoreProvider extends React.PureComponent {
        hmrDispose: any

        static get name() {
          return Klass.name
        }

        get name() {
          return Klass.name
        }

        state = {
          error: null,
        }

        allStores = allStores
        storeHMRCache = {}

        onWillReload() {
          this.onWillReloadStores()
          this.disposeStores()
          this.setupProps()
          this.setupStores()
          this.mountStores()
          this.forceUpdate()
        }

        onReload() {
          this.onReloadStores()
        }

        componentWillMount() {
          this.componentWillUpdate = this.componentWillUpdate.bind(this)
          this.setupProps()
          this.setupStores()
          this.unmounted = false
        }

        // PureComponent means this is only called when props are not shallow equal
        componentWillUpdate(nextProps) {
          updateProps(this._props, nextProps)
        }

        componentDidMount() {
          if (this.stores === null) {
            return
          }
          this.mounted = true
          this.mountStores()
          if (global.Black) {
            this.errorClear = this.clearErrors.bind(this)
            this.hmrDispose = global.Black.view.on('hmr', this.errorClear)
          }
        }

        clearErrors() {
          if (this.unmounted) {
            return
          }
          if (this.clearError) {
            this.clearError()
          }
        }

        clearError() {
          if (this.mounted && !this.unmounted) {
            this.setState({ error: null })
          }
        }

        componentWillUnmount() {
          // if you remove @view({ store: ... }) it tries to remove it here but its gone
          if (this.disposeStores) {
            this.disposeStores()
            this.unmounted = true
            if (this.hmrDispose) {
              this.hmrDispose.dispose()
            }
          }
        }

        componentDidCatch(error) {
          console.warn('StoreProvidable.handleError', error)
          this.setState({ error })
        }

        // for reactive props in stores
        // 🐛 must run this before this.setupStore()
        setupProps() {
          if (!this._props) {
            Mobx.extendObservable(this, { _props: { ...this.props } })
          }
        }

        // DO NOT USE CLASS PROPERTY DECORATORS FOR THIS, IDK WTF WHY
        setupStores() {
          const getProps = {
            get: () => this._props,
            configurable: true,
          }

          // start stores
          const stores = Object.keys(Stores).reduce((acc, cur) => {
            const Store = Stores[cur]
            const createStore = () => {
              if (!Store.prototype) {
                throw new Error(
                  `Store has no prototype from ${this.name}: ${cur}`,
                )
              }
              Object.defineProperty(Store.prototype, 'props', getProps)
              const store = new Store()
              delete Store.prototype.props // safety, remove hack
              // then define directly
              Object.defineProperty(store, 'props', getProps)
              return store
            }
            return {
              ...acc,
              [cur]: createStore(),
            }
          }, {})

          // optional mount function
          if (options.onStoreMount) {
            for (const name of Object.keys(stores)) {
              // fallback to store if nothing returned
              stores[name] =
                options.onStoreMount.call(
                  stores[name],
                  name,
                  stores[name],
                  this.props,
                ) || stores[name]
            }
          }

          this.stores = stores
        }

        mountStores() {
          if (!this.stores) {
            return
          }
          for (const name of Object.keys(this.stores)) {
            const store = this.stores[name]
            if (Helpers) {
              Helpers.emit('store.mount', { name, thing: store })
            }
            if (options.onStoreDidMount) {
              options.onStoreDidMount(store, this.props)
            }
          }
        }

        disposeStores() {
          if (!this.stores) {
            console.log('no stores to dispose')
            return
          }
          for (const name of Object.keys(this.stores)) {
            const store = this.stores[name]
            if (Helpers) {
              Helpers.emit('store.unmount', { name, thing: store })
            }
            if (options.onStoreUnmount) {
              options.onStoreUnmount(store)
            }
          }
        }

        onWillReloadStores() {
          if (!this.stores) {
            return
          }
          this.storeHMRCache = {}
          for (const name of Object.keys(this.stores)) {
            const store = this.stores[name]
            // pass in state + auto dehydrate
            this.storeHMRCache[name] = {
              state: store.dehydrate(),
            }
            if (store.onWillReload) {
              store.willReload(this.storeHMRCache[name])
            }
          }
        }

        onReloadStores() {
          if (!this.stores) {
            return
          }
          for (const name of Object.keys(this.stores)) {
            const store = this.stores[name]
            // auto rehydrate
            if (this.storeHMRCache[name].state) {
              store.hydrate(this.storeHMRCache[name].state)
            }
            if (store.onReload) {
              store.onReload()
            }
          }
        }

        render() {
          return <Klass {...this.props} {...this.stores} />
        }
      }

      if (context && Stores) {
        StoreProvider.prototype.childContextTypes = {
          stores: object,
        }

        StoreProvider.prototype.getChildContext = function() {
          if (options.warnOnOverwriteStore && this.context.stores) {
            Object.keys(Stores).forEach(name => {
              if (this.context.stores[name]) {
                console.log(
                  `Notice! You are overwriting an existing store in provide. This may be intentional: ${name} from ${
                    Klass.name
                  }`,
                )
              }
            })
          }

          const names = Object.keys(Stores)
          const stores = {
            ...this.context.stores,
            ...pickBy(this.stores, (value, key) => names.indexOf(key) >= 0),
          }
          return { stores }
        }
      }

      // copy statics
      hoistStatics(StoreProvider, Klass)

      // add stores to context
      if (context) {
        StoreProvider.contextTypes = {
          stores: object,
        }
        StoreProvider.childContextTypes = {
          stores: object,
        }
      }

      return StoreProvider
    },
  }
}