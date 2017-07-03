import React from 'react'
import { view } from '@mcro/black'
import node from '~/editor/node'
import { Document } from '@mcro/models'
import { Popover, Segment, Button } from '@mcro/ui'
import { isEqual } from 'lodash'
import Router from '~/router'
import CardList from './lists/cardPlugin'
import GridList from './lists/gridPlugin'
import VoteList from './lists/votePlugin'
import List from './lists/listPlugin'
import DocListStore from './store'

@view.attach('docStore')
@node
@view({
  listStore: DocListStore,
})
export default class DocList {
  getList = type => {
    switch (type) {
      case 'list':
        return List
      case 'grid':
        return GridList
      case 'card':
        return CardList
      case 'votes':
        return VoteList
    }
  }

  componentWillMount() {
    const { node, setContext, listStore, listType } = this.props

    if (setContext) {
      setContext(
        <wrap>
          <Button onMouseDown={listStore.createDoc} icon="add" />
          <Popover target={<Button icon="card" />} openOnHover>
            <Segment>
              <Button
                active={listType === 'grid'}
                icon="grid"
                onClick={() => listStore.setType(node, 'grid')}
              />
              <Button
                active={listType === 'card'}
                icon="uilayers"
                onClick={() => listStore.setType(node, 'card')}
              />
              <Button
                active={listType === 'vote'}
                icon="arrows-1_bold-up"
                onClick={() => listStore.setType(node, 'votes')}
              />
              <Button
                active={listType === 'list'}
                icon="list"
                onClick={() => listStore.setType(node, 'list')}
              />
            </Segment>
          </Popover>
        </wrap>
      )
    }
  }

  render({
    docStore,
    node,
    editorStore,
    listStore,
    children,
    attributes,
    setContext,
    ...props
  }) {
    return <note>(doc lists turned off atm due to infinite loop)</note>
    const hasLoaded = !!listStore.docs
    const listType = node.data.get('listType') || 'card'
    const ListView = this.getList(listType)

    if (editorStore && editorStore.inline && listType === 'grid') {
      return <null>sub doc list</null>
    }

    return (
      <doclist contentEditable={false}>
        <ListView
          shouldFocus={listStore.shouldFocus}
          listStore={listStore}
          editorStore={editorStore}
          node={node}
          {...props}
        />
      </doclist>
    )
  }

  static style = {
    doclist: {
      position: 'relative',
    },
    config: {
      position: 'absolute',
      top: -20,
      right: 0,
    },
    top: {
      paddingTop: 3,
      paddingBottom: 3,
      fontSize: 14,
      color: '#555',
    },
    card: {
      // background: '#fff',
      width: '100%',
      height: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    buttons: {
      flexFlow: 'row',
    },
    active: {
      background: 'red',
      color: '#fff',
    },
  }
}