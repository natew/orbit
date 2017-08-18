// @flow
import React from 'react'
import { view, watch } from '@mcro/black'
import * as UI from '@mcro/ui'
import { CurrentUser, Document, Thing } from '~/app'
import { uniq } from 'lodash'
import { filterItem } from './helpers'

class BarMainStore {
  searchResults: Array<Document> = []

  get root() {
    return CurrentUser.home
  }

  get actions() {
    return [
      {
        title: 'Create new topic +',
        type: 'feed',
        category: 'Actions',
      },
    ]
  }

  get integrations() {
    return [
      {
        title: 'Test Open Window',
        type: 'doc',
        doc: {
          url() {
            return '/test'
          },
        },
      },
      {
        title: 'Setup Google Docs',
        data: 'google-docs',
        type: 'setup',
        icon: 'google',
      },
      {
        title: 'Setup Google Drive',
        data: 'google-drive',
        type: 'setup',
        icon: 'disk',
      },
      {
        title: 'Setup Dropbox Paper',
        data: 'dropbox-paper',
        type: 'setup',
        icon: 'dropbox',
      },
      {
        title: 'Setup Trello',
        data: 'trello',
        type: 'setup',
        icon: 'trello',
      },
      {
        title: 'Setup Jira',
        data: 'jira',
        type: 'setup',
        icon: 'jira',
      },
      {
        title: 'Setup Github',
        data: 'github',
        type: 'setup',
        icon: 'github',
      },
    ].map(x => ({
      ...x,
      category: 'Setup Integrations',
    }))
  }

  get browse() {
    return [
      {
        title: 'Subscribed',
        type: 'feed',
        icon: 'radio',
        data: {
          special: true,
        },
      },
      {
        title: 'Assigned to me',
        type: 'task',
        icon: 'check',
      },
      {
        title: 'My Team',
        category: 'Browse',
        type: 'browse',
        url() {
          return '/?home=true'
        },
        icon: 'objects_planet',
      },
      {
        title: 'Company',
        category: 'Browse',
        type: 'browse',
        url() {
          return '/?home=true'
        },
        icon: 'objects_planet',
      },
    ]
  }

  get people() {
    return [
      {
        title: 'Stephanie',
        type: 'feed',
        data: {
          image: 'steph',
        },
        category: 'People',
      },
      {
        title: 'Nate',
        type: 'feed',
        data: { image: 'me' },
        category: 'People',
      },
      {
        title: 'Nick',
        type: 'feed',
        data: { image: 'nick' },
        category: 'People',
      },
    ]
  }

  get results() {
    console.time('Main.results')
    if (!CurrentUser.loggedIn) {
      return [{ title: 'Login', type: 'login' }]
    }

    const { searchResults, integrations, browse, people, actions } = this

    const results = filterItem(
      [
        ...browse,
        ...(searchResults || []),
        ...people,
        ...actions,
        ...integrations,
      ],
      this.props.search
    )

    const final = [
      ...results,
      {
        title: `Search "${this.props.search}"`,
        type: 'feed',
      },
      {
        title: `Feed "${this.props.search}"`,
        type: 'feed',
      },
    ]

    console.timeEnd('Main.results')
    return final
  }

  start() {
    this.props.getRef && this.props.getRef(this)
  }

  search = async () => {
    if (!this.props.search) {
      this.searchResults = []
      return
    }

    const [searchResults, pathSearchResults] = await Promise.all([
      Thing.search && Thing.search(this.props.search).exec(),
      Thing.collection
        .find()
        .where('slug')
        .regex(new RegExp(`^${this.props.search}$`, 'i'))
        .where({ home: { $ne: true } })
        .limit(20)
        .exec(),
    ])

    this.searchResults = uniq(
      [...(searchResults || []), ...pathSearchResults],
      x => x.id
    ).map(doc => {
      return {
        doc,
        title: doc.title,
        type: 'browse',
        category: 'Search Results',
      }
    })
  }

  get length() {
    return (this.results && this.results.length) || 0
  }

  select = index => {
    this.props.navigate(this.results[index])
  }
}

@view({
  store: BarMainStore,
})
export default class BarMain {
  lastSearch = ''

  componentWillReceiveProps() {
    if (this.lastSearch !== this.props.search) {
      this.props.store.search()
      this.lastSearch = this.props.search
    }
  }

  getLength = () => this.props.store.results.length

  getChildSchema = row => {
    const { store } = this.props
    const item = store.results[row]
    return { kind: item.type, data: item.data || {} }
  }

  render({ store, onRef, activeIndex, paneProps }) {
    onRef(this)

    return (
      <pane>
        <UI.List
          if={store.results}
          controlled={false}
          selected={activeIndex}
          itemProps={paneProps.itemProps}
          groupKey="category"
          items={store.results}
          getItem={(result, index) =>
            <UI.ListItem
              highlight={index === activeIndex}
              key={result.id}
              icon={
                result.data && result.data.image
                  ? <img $image src={`/images/${result.data.image}.jpg`} />
                  : result.icon || (result.doc && result.doc.icon)
              }
              primary={result.title}
            />}
        />
      </pane>
    )
  }

  static style = {
    pane: {
      width: 280,
    },
    image: {
      width: 20,
      height: 20,
      borderRadius: 1000,
      margin: 'auto',
    },
  }
}
