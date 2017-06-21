// @flow
import type { RxQuery } from 'rxdb'
import type PouchDB from 'pouchdb-core'
import { observable, autorun } from 'mobx'
import debug from 'debug'
import sum from 'hash-sum'

const out = debug('query')

// TODO: instanceof RxQuery checks

const getSelector = (query: RxQuery) => {
  const selector = { ...query.mquery._conditions }
  // need to delete id or else findAll queries dont sync
  if (!selector._id || !Object.keys(selector._id).length) {
    delete selector._id
  }
  return selector
}

// subscribe-aware helpers
// @query value wrapper
function valueWrap(info, valueGet: Function) {
  const result = observable.shallowBox(undefined)
  let query = valueGet() || {}

  out('query', info.model, info.property, info.args, query.mquery, query)

  // subscribe and update
  let subscriber = null
  const finishSubscribe = () => subscriber && subscriber.complete()

  // this automatically re-runs the susbcription if it has observables
  const stopAutorun = autorun(() => {
    finishSubscribe()
    query = valueGet() || {}
    if (query.$) {
      // sub to values
      subscriber = query.$.subscribe(value => {
        result.set(observable.shallowBox(value))
      })
    }
  })

  // autosync query
  let pull = null
  // query &&
  // query.mquery &&
  // this.collection.sync({
  //   remote: this.remoteDb,
  //   // waitForLeadership: true,
  //   // direction: {
  //   //   pull: true,
  //   //   push: true,
  //   // },
  //   query,
  // })

  const response = {}

  // helpers
  Object.defineProperties(response, {
    $isQuery: {
      value: true,
    },
    exec: {
      value: () => {
        return (query && query.exec
          ? query.exec()
          : Promise.resolve(query)).then(val => {
          // helper: queries return empty objects on null findOne(), this returns null
          if (val instanceof Object && Object.keys(val).length === 0) {
            return null
          }
          return val
        })
      },
    },
    $: {
      value: query.$,
    },
    current: {
      get: () => {
        // ok, i know, i know, you're looking at me with that fuggin look
        // look. this is real strange. but you try returning a single Document.get()
        // and see if the double wrap isn't the only way you get it working.
        // i dare you
        return result.get() && result.get().get()
      },
    },
    observable: {
      value: result,
    },
    dispose: {
      value() {
        out('disposing', info)
        finishSubscribe()
        stopAutorun()
        if (pull) {
          pull.cancel()
        }
      },
    },
  })

  return response
}

export default function query(
  parent: Class,
  property: String,
  descriptor: Object
) {
  const { initializer, value } = descriptor

  if (initializer) {
    descriptor.initializer = function() {
      const init = initializer.call(this)
      return function(...args) {
        if (!this.collection) {
          console.log('no this.collection!')
          return null
        }
        return valueWrap.call(
          this,
          { model: this.constructor.name, property, args },
          () => init.apply(this, args)
        )
      }
    }
  } else if (value) {
    descriptor.value = function(...args) {
      return valueWrap.call(
        this,
        { model: this.constructor.name, property, args },
        () => value.apply(this, args)
      )
    }
  }

  return descriptor
}
