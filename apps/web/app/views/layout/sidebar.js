import { view } from '~/helpers'
import { Page, Link, Input, Button } from '~/views'
import { Place } from 'models'
import Login from './login'
import { SIDEBAR_WIDTH } from '~/constants'
import List from '~/views/list'
import Router from '~/router'
import fuzzy from 'fuzzy'

class SidebarStore {
  places = Place.all()
  placeInput = null
  creatingPlace = false
  filter = ''

  get allPlaces() {
    const myPlace = {
      title: App.loggedIn ? App.user.name : 'me',
      url: _ => '/',
    }
    const results = [
      myPlace,
      { create: this.creatingPlace },
      ...(this.places || []),
    ]
    if (this.filter) {
      return fuzzy
        .filter(this.filter, results, {
          extract: el => (el && el.title) || '',
        })
        .map(i => i.original)
    }
    return results
  }

  createPlace = async e => {
    e.preventDefault()
    const val = this.placeInput.value
    await Place.createWithHome(val)
    this.creatingPlace = false
  }

  onNewPlace = ref => {
    this.placeInput = ref
    if (ref) {
      ref.focus()
    }
  }
}

const SideBarLink = ({ children, after, ...props }) => (
  <Link
    {...props}
    $$style={{
      width: '100%',
      fontWeight: 400,
      fontSize: 18,
      color: 'purple',
      padding: [7, 10],
      cursor: 'pointer',
      '&:hover': {
        background: '#fafafa',
      },
    }}
    active={{
      background: '#fff',
      color: '#000',
      '&:hover': {
        background: '#fafafa',
      },
    }}
  >
    {children}
    <span $$fontSize={10} if={after}>
      {after}
    </span>
  </Link>
)

@view({ store: SidebarStore })
export default class Sidebar {
  render({ store }) {
    return (
      <side>
        <content $$flex $$undraggable>
          <Login />

          <title $$row $$justify="space-between" $$padding={[8, 8, 0]}>
            <input
              $search
              placeholder="search places"
              onChange={e => (store.filter = e.target.value)}
            />
            <Button onClick={() => (store.creatingPlace = true)}>
              +
            </Button>
          </title>
          <main if={store.places}>
            <List
              controlled
              items={store.allPlaces}
              onSelect={place => {
                console.log(place && place.title)
                if (place) {
                  Router.go(place.url())
                }
              }}
              getItem={place => {
                if (place.create === false) {
                  return null
                }
                if (place.create) {
                  return (
                    <List.Item>
                      <item if={store.creatingPlace}>
                        <form onSubmit={store.createPlace}>
                          <Input
                            $create
                            getRef={store.onNewPlace}
                            onKeyDown={e =>
                              e.which === 13 && store.createPlace(e)}
                            placeholder="new place"
                          />
                        </form>
                      </item>
                    </List.Item>
                  )
                }

                return { primary: place.title }
              }}
            />
          </main>
        </content>

        <div $$flex $$draggable />

        <sidebar if={App.activePage.sidebar}>
          {App.activePage.sidebar}
        </sidebar>
      </side>
    )
  }

  static style = {
    side: {
      width: SIDEBAR_WIDTH,
      borderLeft: [1, '#eee'],
      overflowY: 'scroll',
      overflowX: 'hidden',
      userSelect: 'none',
    },
    main: {
      flex: 1,
    },
    h2: {
      fontSize: 14,
      fontWeight: 300,
      padding: [4, 8, 0],
      color: [0, 0, 0, 0.5],
    },
    search: {
      border: 'none',
      fontSize: 16,
      width: '70%',
      lineHeight: '1.5rem',
    },
    create: {
      background: '#eee',
      color: '#000',
      border: 'none',
      margin: [5, 5, 10, 5],
      padding: 8,
      fontSize: 16,
    },
  }
}
