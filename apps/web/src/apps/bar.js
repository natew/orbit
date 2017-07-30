// @flow
import React from 'react'
import { view, watch } from '@mcro/black'
import { HotKeys } from 'react-hotkeys'
import { User } from '~/app'
import * as UI from '@mcro/ui'
import { uniq } from 'lodash'
import InboxList from '~/views/inbox/list'
import fuzzy from 'fuzzy'
import DocumentView from '~/views/document'

const { ipcRenderer } = (window.require && window.require('electron')) || {}

class BarStore {
  column = 0
  searchResults: Array<Document> = []
  highlightIndex = 0
  value = ''

  get currentDoc() {
    return User.home
  }

  @watch children = () => this.currentDoc && this.currentDoc.getChildren()

  get results() {
    const { children, searchResults } = this
    const hayStack = [
      { title: 'Notifications' },
      ...(children || []),
      ...(searchResults || []),
    ]
    return fuzzy
      .filter(this.value, hayStack, {
        extract: el => el.title,
        pre: '<',
        post: '>',
      })
      .map(item => item.original)
  }

  start() {
    this.watch(async () => {
      if (!this.isTypingPath) {
        // search
        const [searchResults, pathSearchResults] = await Promise.all([
          Document.search(this.value).exec(),
          Document.collection
            .find()
            .where('slug')
            .regex(new RegExp(`^${this.value}`, 'i'))
            .limit(20)
            .exec(),
        ])

        this.searchResults = uniq(
          [...(searchResults || []), ...pathSearchResults],
          x => x.id
        )
      } else {
        // path navigate
        this.searchResults = await this.getChildDocsForPath(
          this.typedPathPrefix
        )
      }
    })
  }

  get highlightedDocument() {
    if (this.highlightIndex === -1) return null
    return this.results[this.highlightIndex]
  }

  moveHighlight = (diff: number) => {
    this.highlightIndex += diff
    if (this.highlightIndex === -1) {
      this.highlightIndex = this.results.length - 1
    }
    if (this.highlightIndex >= this.results.length) {
      this.highlightIndex = 0
    }
    log('hlindex', this.highlightIndex)
  }

  onEnter = async () => {
    if (this.highlightIndex > -1) {
      this.navTo(this.highlightedDocument)
    } else {
      const found = await this.createDocAtPath(this.value)
      this.navTo(found)
    }
  }

  onChange = ({ target: { value } }) => {
    this.value = value
  }

  actions = {
    right: () => {
      this.column = this.column + 1
    },
    down: () => {
      this.moveHighlight(1)
    },
    up: () => {
      this.moveHighlight(-1)
    },
    left: () => {
      this.column = Math.max(0, this.column - 1)
    },
    esc: () => {
      ipcRenderer.send('bar-hide')
    },
    cmdA: () => {
      this.inputRef.select()
    },
    enter: () => {
      console.log('enter', this.selectedItem)
      if (this.selectedItem) {
        ipcRenderer.send('bar-goto', this.selectedItem.url())
      }
    },
  }

  setInboxItems = items => {
    this.inboxItems = items
  }

  get selectedItem() {
    switch (this.column) {
      case 0:
        return this.results[this.highlightIndex]
      case 1:
      case 2:
        return this.inboxItems[this.highlightIndex]
    }
  }
}

@view({
  store: BarStore,
})
export default class BarPage {
  render({ store }) {
    // reactive values
    console.log('renderbar', store.column, store.highlightIndex)

    const itemProps = {
      highlightBackground: [0, 0, 0, 0.15],
      highlightColor: [255, 255, 255, 1],
    }

    console.log('store.highlighted', store.highlighted)

    return (
      <HotKeys handlers={store.actions}>
        <UI.Theme name="clear-dark">
          <bar $$fullscreen $$draggable>
            <div>
              <UI.Input
                size={3}
                getRef={store.ref('inputRef').set}
                borderRadius={5}
                onChange={store.onChange}
                borderWidth={0}
                css={{
                  padding: [0, 10],
                }}
              />
            </div>
            <results $column={store.column}>
              <section
                $list
                css={{
                  width: '50%',
                }}
              >
                <UI.List
                  if={store.results}
                  controlled={store.column === 0}
                  isSelected={(item, index) => index === store.highlightIndex}
                  itemProps={{
                    size: 2.5,
                    glow: false,
                    hoverable: true,
                    ...itemProps,
                  }}
                  items={store.results}
                  getItem={result =>
                    <UI.List.Item key={result.id} padding={0} height={60}>
                      <item>
                        {result.title}
                      </item>
                    </UI.List.Item>}
                />
              </section>
              <line
                css={{
                  width: 0,
                  marginTop: 1,
                  borderLeft: [1, 'dotted', [0, 0, 0, 0.1]],
                }}
              />
              <preview
                css={{
                  width: '50%',
                  height: '100%',
                }}
              >
                <InboxList
                  controlled={store.column === 1 || store.column === 2}
                  isSelected={(item, index) => index === store.highlightIndex}
                  getItems={store.setInboxItems}
                  filter={store.value}
                  itemProps={{
                    ...itemProps,
                  }}
                />
              </preview>
              <line
                css={{
                  width: 0,
                  marginTop: 1,
                  borderLeft: [1, 'dotted', [0, 0, 0, 0.1]],
                }}
              />
              <preview
                css={{
                  width: '50%',
                  height: '100%',
                }}
              >
                <DocumentView document={User.home} />
              </preview>
            </results>
          </bar>
        </UI.Theme>
      </HotKeys>
    )
  }

  static style = {
    bar: {
      background: [150, 150, 150, 0.5],
      flex: 1,
    },
    results: {
      borderTop: [1, 'dotted', [0, 0, 0, 0.1]],
      flex: 2,
      flexFlow: 'row',
      // transition: 'transform ease-in 32ms',
    },
    column: column => ({
      transform: {
        x: column > 1 ? '-50%' : 0,
        z: 0,
      },
    }),
    item: {
      fontSize: 38,
      padding: [18, 10],
    },
  }
}
