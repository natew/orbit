import { view } from 'helpers'
import App, { Place, Doc } from 'models'
import Router from 'router'
import { Page, Poof } from 'views'
import DocItem from '~/src/views/doc/item'
import generateName from 'sillyname'
import FlipMove from 'react-flip-move'

class HomeStore {
  places = Place.all()
  docs = Doc.recent()
  place = null
  createdDoc = false

  createDoc = async e => {
    e.preventDefault()
    Doc.create({ title: generateName() })
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

@view.provide({
  store: HomeStore,
})
export default class Home {
  link = piece => e => {
    e.preventDefault()
    Router.go(piece.url())
  }

  componentDidUpdate() {
    if (this.props.store.createdDoc) {
      this.docRef.focus()
      this.props.store.createdDoc = false
    }
  }

  render({ store }) {
    return (
      <Page>
        <Page.Main>
          <FlipMove
            if={store.docs.current}
            $docs
            duration={100}
            easing="ease-out"
          >
            <DocItem key={0} onClick={store.createDoc}>
              <strong>+</strong>
            </DocItem>
            {store.docs.current.map((doc, i) => (
              <DocItem
                ref={ref => {
                  if (i === 0) this.docRef = ref
                }}
                key={doc._id}
                doc={doc}
              />
            ))}
          </FlipMove>
        </Page.Main>

        <Page.Side>
          <h2>Places</h2>
          <form if={App.user} onSubmit={store.createPlace}>
            <input ref={ref => store.place = ref} placeholder="New Place..." />
          </form>
          <places if={store.places.current}>
            {store.places.current.map(piece => (
              <piece key={Math.random()}>
                <a href={piece.url()} onClick={this.link(piece)}>
                  {piece.url()}
                </a>
              </piece>
            ))}
          </places>
        </Page.Side>
      </Page>
    )
  }

  static style = {
    docs: {
      flexFlow: 'row',
      flexWrap: 'wrap',
      flex: 1,
    },
    form: {
      padding: [0, 0, 20, 0],
    },
    h2: {
      fontSize: 14,
      color: [0, 0, 0, 0.5],
    },
    piece: {
      fontWeight: 700,
      fontSize: 14,
      color: 'purple',
    },
  }
}
