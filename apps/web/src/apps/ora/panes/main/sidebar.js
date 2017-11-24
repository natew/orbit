// import * as React from 'react'
// import * as UI from '@mcro/ui'
import { fuzzy } from '~/helpers'
import { Thing } from '~/app'

export default class MainSidebar {
  get search() {
    return this.props.oraStore.search
  }

  get things() {
    return this.props.oraStore.items || []
  }

  NAME_MAP = {
    ncammarata: 'nick',
    natew: 'me',
  }

  get items() {
    return [
      ...this.things.map(x => ({ ...Thing.toResult(x), type: 'context' })),
    ]
  }

  get results() {
    const { search } = this
    const items = [...this.items]
    if (!search) {
      return items
    }
    const filteredSearch = fuzzy(this.items, search)
    const searchItems = filteredSearch.length
      ? filteredSearch
      : [
          {
            type: 'message',
            title: 'No Results...',
            data: { message: 'No results' },
            category: 'Search Results',
          },
        ]
    return searchItems
  }
}
