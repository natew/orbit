// @flow
import * as React from 'react'
import { view } from '@mcro/black'
import Pane from '../pane'
import { SidebarTitle, getItem } from '../helpers'

class SidebarTaskStore {
  results = [
    {
      type: 'task',
      parent: {
        type: 'task',
        id: this.props.data.id,
        data: this.props.data,
      },
      display: <SidebarTitle {...this.props} />,
      onClick: this.props.onBack,
      id: this.props.data.id,
    },
    {
      title: 'Product',
      category: 'Teams',
      type: 'message',
      icon: 'pin',
    },
    {
      title: 'Product',
      category: 'Teams',
      type: 'message',
      icon: 'pin',
    },
    {
      title: 'Product',
      category: 'Teams',
      type: 'message',
      icon: 'pin',
    },
    {
      title: 'Product',
      category: 'Teams',
      type: 'message',
      icon: 'pin',
    },
  ]
}

@view({
  store: SidebarTaskStore,
})
export default class SidebarTaskColumn {
  componentDidMount() {
    this.props.setStore(this.props.store)
  }

  render({ store, data, paneProps }) {
    return (
      <Pane
        items={store.results}
        getItem={getItem(paneProps.getActiveIndex)}
        {...paneProps}
      />
    )
  }
}
