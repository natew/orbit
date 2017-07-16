// @flow
import React from 'react'
import { view } from '@mcro/black'
import * as UI from '@mcro/ui'
import { Document } from '@mcro/models'
import { sortBy, sum } from 'lodash'
import Router from '~/router'
import { watch } from '@mcro/black'
import RightArrow from '~/views/rightArrow'
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove,
} from 'react-sortable-hoc'

type Props = {
  id: number,
  store: object,
}

const DragHandle = SortableHandle(props =>
  <UI.Icon name="menu" size={6} opacity={0.2} {...props} />
)

@view.ui
class Item {
  render({ doc, editable, onSave, textRef, subItems, ...props }) {
    return (
      <doccontainer
        $$undraggable
        onClick={() => doc.url && Router.go(doc.url())}
        {...props}
      >
        <UI.Surface
          icon={doc.type === 'thread' ? 'paper' : null}
          align="center"
          justify="flex-end"
          flexFlow="row"
          iconAfter
          textAlign="right"
          fontSize={18}
          padding={[7, 5]}
        >
          <UI.Text
            $title
            if={doc.title || editable}
            editable={editable}
            onFinishEdit={onSave}
            ref={textRef}
          >
            {doc.title}
          </UI.Text>
        </UI.Surface>

        <subitems if={false}>
          {(subItems &&
            subItems.length &&
            <subdocs>
              <RightArrow $arrow css={{ transform: { scale: 0.5 } }} />
              {subItems.map(child =>
                <UI.Text
                  key={child._id}
                  onClick={() => Router.go(child.url())}
                  size={0.8}
                >
                  {child.title}
                </UI.Text>
              )}
            </subdocs>) ||
            null}
        </subitems>
        <DragHandle if={false} css={{ margin: ['auto', -12, 'auto', 12] }} />
      </doccontainer>
    )
  }
  static style = {
    doccontainer: {
      position: 'relative',
      opacity: 0.8,
      transition: 'transform ease-in 50ms',
      transform: {
        scale: 1,
      },
      '&:hover': {
        opacity: 1,
        transform: {
          scale: 1.03,
          x: -2,
        },
      },
    },
    icon: {
      padding: [5, 0, 0],
    },
    title: {
      fontWeight: 300,
      fontSize: 20,
      lineHeight: '1.3rem',
      width: '100%',
      color: '#000',
    },
  }
}

const SortableItem = SortableElement(props =>
  <Item style={{ zIndex: 1000000 }} {...props} />
)

class ExplorerChildrenStore {
  children = {}
  version = 1

  lastDocs = null // temp until queries returning blank for a frame is fixed

  @watch
  docs = ({ explorerStore: { document } }) =>
    this.version && document && document.getChildren && document.getChildren()

  creatingDoc = false
  @watch
  newDoc = () =>
    this.creatingDoc && this.props.explorerStore.document
      ? Document.createTemporary({
          parentId: this.props.explorerStore.document._id,
          parentIds: [this.props.explorerStore.document._id],
          type: this.docType,
        })
      : null

  get allDocs() {
    let { docs, lastDocs } = this
    if ((!docs || !docs.length) && lastDocs) {
      return lastDocs
    }
    const result = sortBy(docs || [], 'createdAt')
    return result
  }

  sortedDocs = null

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.sortedDocs = arrayMove(this.allDocs, oldIndex, newIndex)
  }

  get hasDocs() {
    return this.allDocs.length
  }

  start() {
    this.watch(() => {
      if (this.docs && this.docs.length) {
        this.lastDocs = this.docs
      }
    })

    this.watch(async () => {
      if (this.docs && this.docs.length) {
        const allChildren = await Promise.all(
          this.docs.map(async doc => {
            return {
              id: doc._id,
              children: doc.getChildren && (await doc.getChildren()),
            }
          })
        )
        this.children = allChildren.reduce(
          (acc, { id, children }) => ({
            ...acc,
            [id]: children,
          }),
          {}
        )
      }
    })
  }

  createDoc = () => {
    this.docType = 'document'
    this.creatingDoc = true
  }

  createThread = () => {
    this.docType = 'thread'
    this.creatingDoc = true
  }

  saveCreatingDoc = async title => {
    this.newDoc.title = title
    this.newDoc.type = this.docType
    await this.newDoc.save()
    log('saved', this.newDoc.id)
    this.version++
    this.creatingDoc = false
    // this.setTimeout(() => {

    // }, 500)
  }
}

const SortableChildren = SortableContainer(({ items, store }) =>
  <docs>
    {items.map(doc => {
      const subItems = store.children[doc._id]
      return <SortableItem key={doc._id} doc={doc} subItems={subItems} />
    })}
  </docs>
)

@view.attach('explorerStore')
@view({
  store: ExplorerChildrenStore,
})
export default class ExplorerChildren {
  props: Props

  onNewItemText = ref => {
    if (ref) {
      ref.focus()
    }
  }

  render({ store, store: { hasDocs, sortedDocs, allDocs } }: Props) {
    return (
      <children $$draggable>
        <UI.Popover
          openOnHover
          delay={100}
          background
          elevation={4}
          borderRadius={10}
          closeOnClick
          keepOpenOnClickTarget
          arrowSize={11}
          distance={0}
          towards="left"
          target={<UI.Button chromeless icon="add" margin={[0, 0, 5]} />}
        >
          <UI.Segment
            chromeless
            css={{
              padding: 1,
              paddingLeft: 2,
            }}
            itemProps={{
              chromeless: true,
            }}
          >
            <UI.Button
              onClick={store.createThread}
              icon="shopping_list"
              size={0.9}
              color={[0, 0, 0, 0.7]}
            >
              List
            </UI.Button>
            <UI.Button
              onClick={store.createDoc}
              icon="filesg"
              size={0.9}
              color={[0, 0, 0, 0.7]}
            >
              Page
            </UI.Button>
          </UI.Segment>
        </UI.Popover>

        <contents>
          <Item
            if={store.newDoc}
            editable
            onSave={store.saveCreatingDoc}
            doc={store.newDoc}
            textRef={this.onNewItemText}
          />
          <SortableChildren
            if={hasDocs}
            items={sortedDocs || allDocs}
            store={store}
            onSortEnd={store.onSortEnd}
            pressDelay={500}
          />
        </contents>

        <shadow if={false} $glow />
        <background $glow />
        <fade $bottom />
      </children>
    )
  }

  static style = {
    children: {
      borderTop: [1, '#eee', 'dotted'],
      padding: [10, 1, 10, 0],
      flex: 1,
      alignItems: 'flex-end',
      position: 'relative',
    },
    contents: {
      flex: 1,
      overflowY: 'scroll',
    },
    arrow: {
      height: 20,
      margin: ['auto', 0],
    },
    subdocs: {
      flexFlow: 'row',
      justifyContent: 'flex-end',
      overflow: 'hidden',
      opacity: 0.5,
      textAlign: 'right',
    },
    text: {
      lineHeight: '1.4rem',
    },
    glow: {
      position: 'absolute',
      right: 0,
      left: 0,
      borderRadius: 1000,
    },
    shadow: {
      background: '#000',
      zIndex: 1,
      top: -35,
      bottom: 10,
      filter: 'blur(10px)',
      opacity: 0.12,
      transform: {
        x: '23%',
      },
    },
    background: {
      top: 0,
      filter: 'blur(40px)',
      bottom: 40,
      zIndex: -1,
      background: 'white',
      transform: {
        x: '20%',
      },
    },
    fade: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 50,
      zIndex: 10000000,
      pointerEvents: 'none',
    },
    bottom: {
      bottom: 0,
      background: 'linear-gradient(transparent, #fff)',
    },
  }
}
