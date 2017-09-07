// @flow
import global from 'global'
import { fromStream, fromPromise, isPromiseBasedObservable } from 'mobx-utils'
import * as Mobx from 'mobx'
import { Observable } from 'rxjs'

if (module && module.hot) {
  module.hot.accept(_ => _) // prevent aggressive hmrs
}

const isObservable = x => {
  if (!x) {
    return false
  }
  if (x.isObservable) {
    return true
  }
  try {
    return Mobx.isObservable(x)
  } catch (e) {
    return false
  }
}
const isFunction = val => typeof val === 'function'
const isQuery = val => val && !!val.$isQuery
const isRxObservable = val => val instanceof Observable
const isPromise = val => val instanceof Promise
const isWatch = (val: any) => val && val.IS_AUTO_RUN
const isObservableLike = val =>
  (val && (val.isntConnected || val.isObservable || isObservable(val))) || false

const DEFAULT_VALUE = undefined

export default function automagical() {
  return {
    name: 'automagical',
    decorator: (Klass: Class<any> | Function) => {
      if (!Klass.prototype.constructor) {
        return Klass
      }

      class ProxyClass extends Klass {
        static get name() {
          return Klass.name
        }
        constructor(...args: Array<any>) {
          super(...args)
          automagic(this)
        }
      }

      return ProxyClass
    },
  }
}

const FILTER_KEYS = {
  componentDidMount: true,
  componentDidUpdate: true,
  componentWillMount: true,
  componentWillReceiveProps: true,
  componentWillUnmount: true,
  constructor: true,
  context: true,
  dispose: true,
  props: true,
  react: true,
  ref: true,
  render: true,
  setInterval: true,
  setTimeout: true,
  shouldComponentUpdate: true,
  start: true,
  stop: true,
  subscriptions: true,
  watch: true,
  $mobx: true,
  emitter: true,
  emit: true,
  on: true,
  CompositeDisposable: true,
  glossElement: true,
}

function collectGetterPropertyDescriptors(obj) {
  const proto = Object.getPrototypeOf(obj)
  const fproto = Object.getOwnPropertyNames(proto).filter(
    x => !FILTER_KEYS[x] && x[0] !== '_'
  )
  return fproto.reduce(
    (acc, cur) => ({
      ...acc,
      [cur]: Object.getOwnPropertyDescriptor(proto, cur),
    }),
    {}
  )
}

function mobxifyQuery(obj, method, val) {
  Object.defineProperty(obj, method, {
    get() {
      return val.current // hit observable
    },
  })
  obj.subscriptions.add(val)
  return val
}

function mobxifyPromise(obj, method, val) {
  const observable = fromPromise(val)
  Object.defineProperty(obj, method, {
    get() {
      return observable.value
    },
  })
}

function mobxifyRxQuery(obj, method) {
  const value = obj[method]
  const observable = Mobx.observable.box(undefined)
  const runObservable = () => {
    const stream = value.$.subscribe(res => {
      observable.set(res)
    })
    obj.subscriptions.add(() => stream.unsubscribe())
  }
  if (value.isntConnected) {
    value.onConnection().then(runObservable)
  } else {
    runObservable()
  }
  Object.defineProperty(obj, method, {
    get() {
      return observable.get()
    },
  })
}

// TODO use rxdb api
function isRxDbQuery(query: any): boolean {
  return query && (query.isntConnected || !!query.mquery)
}

function mobxifyRxObservable(obj, method, val) {
  const stream = fromStream(val || obj[method])
  Mobx.extendShallowObservable(obj, { [method]: stream })
  obj.subscriptions.add(stream)
}

function automagic(obj: Object) {
  const descriptors = {
    ...Object.getOwnPropertyDescriptors(obj),
    ...collectGetterPropertyDescriptors(Object.getPrototypeOf(obj)),
  }

  // mutate to be mobx observables
  for (const method of Object.keys(descriptors)) {
    mobxify(obj, method, descriptors[method])
  }
}

// * => mobx
function mobxify(target: Object, method: string, descriptor: Object) {
  // @computed get (do first to avoid hitting the getter on next line)
  if (descriptor && !!descriptor.get) {
    Mobx.extendObservable(target, {
      [method]: Mobx.computed(descriptor.get),
    })
    return
  }

  let value = target[method]

  // let it be
  if (isObservable(value)) {
    return value
  }
  // @watch: autorun |> automagical (value)
  if (isWatch(value)) {
    return mobxifyWatch(target, method, value)
  }
  if (isPromise(value)) {
    mobxifyPromise(target, method, value)
    return
  }
  if (isQuery(value)) {
    mobxifyQuery(target, method, value)
    return
  }
  if (isRxObservable(value)) {
    mobxifyRxObservable(target, method)
    return
  }
  if (isRxDbQuery(value)) {
    mobxifyRxQuery(target, method)
    return
  }
  if (isFunction(value)) {
    // @action
    const targetMethod = target[method].bind(target)
    const NAME = `${target.constructor.name}.${method}`
    const logWrappedMethod = (...args) => {
      if (global.log && global.log.debug) {
        if (global.log.filter && global.log.filter.test(NAME)) {
          console.log(NAME, ...args)
        }
      }
      return targetMethod(...args)
    }

    target[method] = Mobx.action(NAME, logWrappedMethod)
    return target[method]
  }
  // @observable.ref
  Mobx.extendShallowObservable(target, { [method]: value })
  return value
}

// * => Mobx
function resolve(inValue: any) {
  let value = inValue
  // convert RxQuery to RxObservable
  if (value) {
    if (isRxDbQuery(value)) {
      if (!value.isntConnected) {
        value = value.$
      } else {
        return value
      }
    }
    // let this fall through from rxdbquerys
    if (isRxObservable(value)) {
      const observable = value
      const mobxStream = fromStream(value)
      return {
        get: () => mobxStream.current,
        mobxStream,
        observable,
        dispose: mobxStream.dispose,
        isObservable: true,
      }
    }
  }
  return value
}

const AID = '__AUTOMAGICAL_ID__'
const uid = () => `__ID_${Math.random()}__`

// watches values in an autorun, and resolves their results
function mobxifyWatch(obj, method, val) {
  // const debug = (...args) => {
  //   const KEY = `${obj.constructor.name}.${method}--${Math.random()}--`
  //   console.log(KEY, ...args)
  // }

  let current = Mobx.observable.box(DEFAULT_VALUE)
  let currentDisposable = null
  let currentObservable = null
  let autoObserver = null
  const stopAutoObserve = () => autoObserver && autoObserver()

  const update = newValue => {
    let value = newValue
    if (Mobx.isObservableArray(value) || Mobx.isObservableMap(value)) {
      value = Mobx.toJS(value)
    }
    // debug('update ===', value)
    current.set(Mobx.observable.box(value))
  }

  function runObservable() {
    stopAutoObserve()
    autoObserver = Mobx.autorun(() => {
      if (currentObservable) {
        const value = currentObservable.get
          ? currentObservable.get()
          : currentObservable
        update(value) // set + wrap
      }
    })
  }

  let stop
  let disposed = false

  const dispose = () => {
    if (disposed) {
      return
    }
    if (currentDisposable) {
      currentDisposable()
    }
    stop()
    stopAutoObserve && stopAutoObserve()
    disposed = true
  }

  function watcher(val) {
    let value = val

    return function watcherCb() {
      const result = resolve(value.call(obj, obj.props)) // hit user observables // pass in props
      const observableLike = isObservableLike(result)
      stopAutoObserve()

      const replaceDisposable = () => {
        if (currentDisposable) {
          currentDisposable()
          currentDisposable = null
        }
        if (result && result.dispose) {
          currentDisposable = result.dispose.bind(result)
        }
      }

      if (observableLike) {
        if (result.isntConnected) {
          // try on reconnect
          result.onConnection().then(() => {
            // re-run after connect
            dispose()
            watcherCb()
          })
          return false
        }
        const isSameObservable =
          currentObservable && currentObservable[AID] === result[AID]
        if (isSameObservable) {
          update(currentObservable.get())
          return
        }
        replaceDisposable()
        currentObservable = result
        currentObservable[AID] = currentObservable[AID] || uid()
        runObservable()
      } else {
        replaceDisposable()
        if (isPromise(result)) {
          current.set(fromPromise(result))
        } else {
          // debug('watchForNewValue ===', result)
          update(result)
        }
      }
    }
  }

  // autorun vs reaction
  if (Array.isArray(val)) {
    // reaction
    stop = Mobx.reaction(val[0], watcher(val[1]), true)
  } else {
    //autorun
    stop = Mobx.autorun(watcher(val))
  }

  Object.defineProperty(obj, method, {
    get() {
      const result = current.get()
      if (result && isPromiseBasedObservable(result)) {
        return result.value
      }
      if (isObservable(result)) {
        let value = result.get()
        return value
      }
      return result
    },
  })

  Object.defineProperty(obj, `${method}__automagic_source`, {
    get() {
      return { current, currentObservable }
    },
  })

  obj.subscriptions.add(dispose)

  return current
}