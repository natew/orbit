// @flow
import { store } from '@mcro/black/store'
import { isEqual } from 'lodash'
import ReconnectingWebSocket from 'reconnecting-websocket'
import WebSocket from './websocket'
import waitPort from 'wait-port'

const log = debug('Bridge')

@store
class Bridge {
  _store = null
  _options = {}
  _queuedState = false
  _wsOpen = false
  _source = ''
  _initialState = []
  _socket = null
  // to be set once they are imported
  stores = {}

  get state() {
    return this._store.state
  }

  // note: you have to call start to make it explicitly connect
  start = async (store, initialState, options = {}) => {
    if (!store) {
      throw new Error(`No source given for starting screen store`)
    }
    if (this.store || this._socket) {
      throw new Error(`Already started`)
    }
    this._socket = new ReconnectingWebSocket(
      'ws://localhost:40510',
      undefined,
      {
        constructor: WebSocket,
      },
    )
    this._source = store.constructor.name
    this._store = store
    this._options = options
    // set initial state synchronously before
    this._initialState = initialState
    if (initialState) {
      this._setState(initialState, true)
    }
    if (typeof window === 'undefined') {
      await waitPort({ host: 'localhost', port: 40510 })
    }
    this._socket.onmessage = ({ data }) => {
      if (!data) {
        console.log(`No data received over socket`)
        return
      }
      try {
        const messageObj = JSON.parse(data)
        if (messageObj && typeof messageObj === 'object') {
          const { source, state: newState } = messageObj
          if (
            this._options.ignoreSource &&
            this._options.ignoreSource[source]
          ) {
            return
          }
          if (!newState) {
            throw new Error(`No state received from message: ${data}`)
          }
          if (!source) {
            throw new Error(`No source store
              source: ${source}
              data: ${data}
            `)
          }
          if (!this.stores[source]) {
            console.warn(
              `Store not imported:
                this.stores: ${JSON.stringify(this.stores, 0, 2)}
                source: ${source}`,
            )
            return
          }
          const store = this.stores[source]
          const { state } = store
          if (!state) {
            throw new Error(
              `No state found for source (${source}) state (${state}) store(${store})`,
            )
          }
          this._update(state, newState)
        } else {
          throw new Error(`Non-object received`)
        }
      } catch (err) {
        console.log(
          `${err.message}:\n${err.stack}\n
          Bridge error receiving or reacting to message. Initial message:
          ${data}`,
        )
      }
    }
    this._socket.onopen = () => {
      this._wsOpen = true
      // send state that hasnt been synced yet
      if (this._queuedState) {
        console.log('sending queued state', this._source)
        this._socket.send(
          JSON.stringify({ state: this.state, source: this._source }),
        )
        this._queuedState = false
      }
    }
    this._socket.onclose = () => {
      this._wsOpen = false
    }
    this._socket.onerror = err => {
      if (this._socket.readyState == 1) {
        console.log('swift ws error', err)
      }
    }
  }

  // this will go up to api and back down to all screen stores
  // set is only allowed from the source its set as initially
  _setState = (newState, isInternal = false) => {
    if (!this._store) {
      throw new Error(
        `Called ${this.storeName}.setState before calling ${
          this.storeName
        }.start`,
      )
    }
    if (!newState || typeof newState !== 'object') {
      throw new Error(
        `Bad state passed to ${this.storeName}.setState: ${newState}`,
      )
    }
    // update our own state immediately so its sync
    const changedState = this._update(this.state, newState, isInternal)
    if (!this._wsOpen) {
      this._queuedState = true
      return changedState
    }
    if (Object.keys(changedState).length) {
      if (process.env.NODE_ENV === 'development') {
        log(`${this._source}.setState(${JSON.stringify(newState, 0, 2)})`)
      }
      this._socket.send(
        JSON.stringify({ state: changedState, source: this._source }),
      )
    }
    return changedState
  }

  // private
  // return keys of changed items
  _update = (stateObj, newState, isInternal) => {
    // log('_update', stateObj, newState, isInternal)
    const changed = {}
    for (const key of Object.keys(newState)) {
      if (isInternal && typeof this._initialState[key] === 'undefined') {
        console.error(
          `${this.storeName}._update: tried to set a key not in initialState

            initial state keys: ${JSON.stringify(
              Object.keys(this._initialState),
            )}

            key: ${key}

            value: ${JSON.stringify(newState, 0, 2)}`,
        )
        return changed
      }
      if (!isEqual(stateObj[key], newState[key])) {
        const value = newState[key]
        stateObj[key] = value
        changed[key] = value
      }
    }
    return changed
  }
}

// singleton because
export default new Bridge()