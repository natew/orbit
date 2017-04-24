import { view } from '~/helpers'
import App, { Place, Doc } from 'models'
import FlipMove from 'react-flip-move'
import { Page, Poof, CircleButton, Link, Input } from '~/views'
import DocItem from '~/views/document/item'
import Grid from '~/views/grid'
import Sidebar from '~/views/layout/sidebar'

class HomeStore {
  docs = Doc.recent()
  place = null
  createdDoc = false

  createDoc = e => {
    e.preventDefault()
    Doc.create()
    this.createdDoc = true
  }

  createPlace = e => {
    e.preventDefault()
    Place.create({
      title: this.place.value,
      author_id: App.user.name,
    })
  }
}

@view({
  store: HomeStore,
})
export default class Home {
  componentDidUpdate() {
    if (this.props.store.createdDoc && this.docRef) {
      this.docRef.focus()
      this.props.store.createdDoc = false
    }
  }

  render({ store }) {
    const cardHeight = 200

    const docs = (store.docs.current || []).map((doc, i) => (
      <DocItem
        slanty
        draggable
        getRef={ref => {
          if (i === 0) {
            this.docRef = ref
          }
        }}
        doc={doc}
      />
    ))

    return (
      <Page $$padded>
        <CircleButton onClick={store.createDoc}>
          +
        </CircleButton>
        <Grid
          layout={[
            {
              w: 1,
              h: 1,
              x: 0,
              y: 0,
              i: '0',
              moved: false,
              static: false,
            },
            {
              w: 1,
              h: 1,
              x: 1,
              y: 0,
              i: '1',
              moved: false,
              static: false,
            },
            {
              w: 1,
              h: 1,
              x: 1,
              y: 1,
              i: '2',
              moved: false,
              static: false,
            },
          ]}
          cols={2}
          rowHeight={cardHeight}
          items={docs}
        />
        <FlipMove if={false} $docs duration={300} easing="ease-out">
          {docs}
        </FlipMove>
      </Page>
    )
  }

  static style = {
    docs: {
      flexFlow: 'row',
      flexWrap: 'wrap',
      maxHeight: '100%',
      position: 'relative',
    },
    form: {
      padding: [0, 0, 20, 0],
    },
    form: {
      margin: 0,
    },
  }
}
