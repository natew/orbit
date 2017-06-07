import React from 'react'
import { view, watch } from '@jot/black'
import { User, Place, Document } from '@jot/models'
import { Grid, Button, SlotFill } from '~/ui'
import PlacePage from './place'
import DocumentView from '~/views/document'
import { BLOCKS } from '~/editor/constants'
import DocItem from '~/views/document/item'

const idFn = _ => _

@view({
  store: class PlaceTileStore {
    document = Document.homeForPlace(this.props.place._id)
  },
})
class PlaceTile {
  render({ store: { document } }) {
    console.log('place tile fetch', document)
    return (
      <DocumentView
        if={document}
        inline
        editorProps={{ onlyNode: BLOCKS.UL_LIST }}
        id={document._id}
      />
    )
  }
}

class HomeStore {
  editing = true

  userPlace = watch(() => User.loggedIn && Place.get({ slug: User.user.name }))
  placeDocs = watch(() => User.loggedIn && Document.placeDocsForUser())

  get layout() {
    if (this.updateVersion === 0) {
      return []
    }
    return User.user.layout
  }

  updateVersion = 0
  updateLayout = async layout => {
    // bullshit react grid calls onLayoutChange on first run
    this.updateVersion++
    if (this.updateVersion === 1) return
    await User.updateInfo({ layout })
  }
}

@view({
  store: HomeStore,
})
export default class HomePage {
  render({ store }) {
    console.log('HOME_STORE', store)

    if (!User.loggedIn) {
      return <center $$centered>login plz</center>
    }

    console.log('home layout', store.layout)

    return (
      <home>
        <SlotFill.Fill name="actions">
          <actions>
            <Button
              icon="edit"
              active={store.editing}
              onClick={store.ref('editing').toggle}
            >
              Edit
            </Button>
          </actions>
        </SlotFill.Fill>
        <Grid
          onLayoutChange={store.updateLayout}
          layout={store.layout}
          cols={4}
          rowHeight={150}
          margin={store.editing ? [10, 10] : [0, 0]}
          isDraggable={store.editing}
          isResizable={store.editing}
          items={(store.placeDocs || [])
            .map(doc =>
              <DocItem
                key={doc._id || Math.random()}
                draggable
                inline
                bordered={store.editing}
                readOnly={store.editing}
                hideMeta={!store.editing}
                doc={doc}
              />
            )}
        />

        <top if={false}>
          <place>
            <title>Drafts</title>
            <PlaceTile if={store.userPlace} place={store.userPlace} />
          </place>
        </top>
      </home>
    )
  }

  static style = {
    home: {
      flex: 1,
    },
  }
}
