import React from 'react'
import { Editor, Raw } from 'slate'
import { node, view, observable } from '~/helpers'

class CounterStore {
  diff = num => {
    const { node: { data }, setData } = this.props
    const next = data.set('count', (data.get('count') || 0) + num)
    setData(next)
  }
}
@node
@view({
  store: CounterStore,
})
export default class Counter {
  render({ store, node: { data } }) {
    return (
      <div contentEditable="false">
        <h1>
          count: {data.get('count')}
        </h1>

        <a
          onClick={() => {
            this.props.onDestroy()
          }}
        >
          close
        </a>
        <button onClick={() => store.diff(1)}>up</button>
        <button onClick={() => store.diff(-1)}>down</button>
      </div>
    )
  }

  static style = {}
}
