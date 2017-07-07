// @flow
import React from 'react'
import { view } from '@mcro/black'
import * as UI from '@mcro/ui'
import { Document } from '@mcro/models'
import { sortBy } from 'lodash'
import Router from '~/router'

type Props = {
  id: number,
  store: object,
}

@view({
  store: class ChildrenStore {
    children = {}
    docs = Document.child(this.props.id)
    newTitle = null

    start() {
      this.watch(async () => {
        if (this.docs && this.docs.length) {
          this.children = {}
          const allChildren = await Promise.all(
            this.docs.map(async doc => ({
              id: doc._id,
              children: await doc.getChildren(),
            }))
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

    add = () => {
      this.newTitle = ''
    }

    create = async () => {
      const { id } = this.props
      await Document.create({ parentId: id, title: this.newTitle })
      this.newTitle = null
    }
  },
})
export default class Children {
  props: Props

  render({ store }: Props) {
    const { docs } = store
    const hasDocs = store.newTitle !== null || (docs || []).length > 0
    const allDocs = sortBy(docs || [], 'createdAt')

    // const getDoc = doc => {
    //   return {
    //     onClick() {
    //       Router.go(doc.url())
    //     },
    //     primary: (
    //       <div $$row $$align="center">
    //         <name>
    //           <span $$ellipse>
    //             {doc.getTitle()}
    //           </span>
    //         </name>
    //       </div>
    //     ),
    //     secondary: (
    //       <content if={children}>

    //       </content>
    //     ),
    //   }
    // }
    // const newDoc =
    //   store.newTitle === null
    //     ? null
    //     : {
    //         primary: (
    //           <div $$row $$align="center">
    //             <name>
    //               <input
    //                 $name
    //                 autoFocus
    //                 value={store.newTitle}
    //                 onKeyDown={e => e.which === 13 && store.create()}
    //                 onChange={e => (store.newTitle = e.target.value)}
    //                 onBlur={e => (store.newTitle = null)}
    //               />
    //             </name>
    //           </div>
    //         ),
    //       }

    // const items = [
    //   ...sortBy(docs || [], 'createdAt').map(getDoc),
    //   ...(newDoc ? [newDoc] : []),
    // ]

    return (
      <children>
        <actions
          $$row
          $$centered
          css={{
            position: 'absolute',
            top: -22,
            right: 10,
          }}
        >
          <UI.Button marginRight={10} size={0.9} icon="down" elevation={0.25}>
            Sort
          </UI.Button>
          <UI.Button
            if={store.newTitle === null}
            size={1}
            icon="siadd"
            circular
            size={1.5}
            elevation={1}
            onClick={store.add}
          />
        </actions>
        <docs if={hasDocs}>
          {allDocs.map((doc, index) => {
            const children = store.children[doc._id]

            return (
              <surface
                justify="flex-start"
                $doc
                key={index}
                onClick={() => Router.go(doc.url())}
              >
                <title $$row>
                  {doc.title}&nbsp;{' '}
                  <span $rest>Lorem ipsum dolor sit amet...</span>
                </title>
                <paths if={children}>
                  {children.map(child =>
                    <UI.Button
                      chromeless
                      key={child._id}
                      onClick={() => Router.go(child.url())}
                    >
                      {child.getTitle()}
                    </UI.Button>
                  )}
                </paths>
              </surface>
            )
          })}
        </docs>
      </children>
    )
  }

  static style = {
    title: {
      margin: 0,
      padding: 0,
      fontWeight: 600,
      fontSize: 18,
      lineHeight: '30px',
      color: '#555',
    },
    text: {
      lineHeight: '1.4rem',
    },
    rest: {
      color: [0, 0, 0, 0.2],
      fontSize: 14,
      fontWeight: 400,
    },
    children: {
      borderTop: [1, '#eee'],
      background: '#fff',
      padding: 16,
      position: 'relative',
    },
    paths: {
      flexFlow: 'row',
    },
    child: {
      fontSize: 16,
    },
    docs: {
      flexFlow: 'row',
      flexWrap: 'wrap',
      marginRight: -12,
    },
    doc: {
      maxWidth: 300,
      minWidth: 200,
      flex: 1,
      margin: [0, 12, 16, 0],
      zIndex: 1,
      padding: [10, 12],
      '&:hover title': {
        color: [0, 0, 0],
      },
      '&:hover p': {
        color: [50, 50, 50],
      },
    },
  }
}
