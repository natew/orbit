// @flow
import { view, store } from '@mcro/black'
import { autorunAsync } from 'mobx'
import { uniqBy } from 'lodash'
import Models from '@mcro/models'

declare class AppStore {
  config: Object,
  modelsList: Array<Models>,
  models?: Models,
}

@store
export default class App implements AppStore {
  started = false
  errors = []
  mountedStores = {}
  mountedVersion = 0
  stores = null

  constructor({ config, models }) {
    this.config = config
    this.modelsObjects = models
    // listen for stores, attach here
    view.on('store.mount', this.mountStore)
    view.on('store.unmount', this.unmountStore)
  }

  start = async quiet => {
    if (!quiet) {
      console.log(
        '%cUse App in your console to access models, stores, etc',
        'background: yellow'
      )
      console.time('start')
    }
    this.models = new Models(this.config, this.modelsObjects)
    await this.models.start()
    this.catchErrors()
    this.trackMountedStores()
    if (!quiet) {
      console.timeEnd('start')
    }
    this.started = true
  }

  dispose = () => {
    this.models.dispose()
  }

  // dev helpers

  trackMountedStores = () => {
    // auto Object<string, Set> => Object<string, []>
    autorunAsync(() => {
      this.mountedVersion
      this.stores = Object.keys(this.mountedStores).reduce((acc, key) => {
        const entries = []
        this.mountedStores[key].forEach(store => {
          entries.push(store)
        })
        return {
          ...acc,
          [key]: entries,
        }
      }, {})
    }, 1)
  }

  mountStore = store => {
    const key = store.constructor.name
    this.mountedStores[key] = this.mountedStores[key] || new Set()
    this.mountedStores[key].add(store)
    this.mountedVersion++
  }

  unmountStore = store => {
    const key = store.constructor.name
    if (this.mountedStores[key]) {
      this.mountedStores[key].delete(store)
      this.mountedVersion++
    }
  }

  // TODO make this not hacky
  // could actually just be a Proxy around this class that finds these
  get layoutStore(): LayoutStore {
    return this.stores && this.stores.LayoutStore && this.stores.LayoutStore[0]
  }

  get commander(): CommanderStore {
    return (
      this.stores && this.stores.CommanderStore && this.stores.CommanderStore[0]
    )
  }

  get editor(): EditorStore {
    return (
      this.stores &&
      this.stores.EditorStore &&
      (this.stores.EditorStore.find(store => store.focused === true) ||
        this.stores.EditorStore[0])
    )
  }

  get document(): DocumentStore {
    return (
      this.stores && this.stores.DocumentStore && this.stores.DocumentStore[0]
    )
  }

  get editorState() {
    return this.editor && this.editor.slate.getState()
  }

  get docLayout() {
    return this.editorState.document.nodes.findByType('docList')
  }

  handleError = (...errors) => {
    const unique = uniqBy(errors, err => err.name)
    const final = []
    for (const error of unique) {
      try {
        final.push(JSON.parse(error.message))
      } catch (e) {
        final.push({ id: Math.random(), ...error })
      }
    }
    this.errors = uniqBy([...final, ...this.errors], err => err.id)
  }

  catchErrors() {
    window.addEventListener('unhandledrejection', event => {
      event.promise.catch(err => {
        this.handleError({ ...err, reason: event.reason })
      })
    })
  }

  clearErrors = () => {
    this.errors = []
  }
}
