import { view, Shortcuts } from '~/helpers'
import { uniqBy } from 'lodash'
import { Pane, ContextMenu, List, Link, Input, Button } from '~/ui'
import { Place } from '@jot/models'
import Login from './login'
import { SIDEBAR_WIDTH } from '~/constants'
import Router from '~/router'
import fuzzy from 'fuzzy'

const Text = ({ getRef, ...props }) => (
  <text ref={getRef} $$marginLeft={props.active ? -2 : 0} {...props} />
)

const SideBarItem = ({ children, isEditing, after, ...props }) => {
  const editStyle = isEditing && {
    background: '#faecf7',
    cursor: 'text',
  }

  return (
    <Link
      {...props}
      style={{
        gloss: true,
        color: [0, 0, 0, 0.75],
        width: '100%',
        fontSize: 14,
        padding: [4, 10],
        cursor: 'pointer',
        '&:hover': {
          background: '#faecf7',
        },
        ...editStyle,
      }}
      active={{
        fontWeight: 500,
        color: '#684f63',
        background: '#f1d6eb',
        '&:hover': {
          background: '#f1d6eb',
        },
      }}
    >
      {children}
    </Link>
  )
}

class SidebarStore {
  places = Place.all()
  placeInput = null
  active = null
  editingPlace = false
  filter = ''

  get allPlaces() {
    const myPlace = {
      title: App.loggedIn ? App.user.name : 'me',
      url: _ => '/',
    }
    const results = [
      myPlace,
      this.editingPlace === true && { create: true },
      ...(this.places || []),
    ].filter(x => !!x)

    if (this.filter) {
      return fuzzy
        .filter(this.filter, results, {
          extract: el => (el && el.title) || '',
        })
        .map(i => i.original)
    }
    return uniqBy(results, r => r.title)
  }

  createPlace = async () => {
    if (!this.placeInput) {
      return
    }
    const val = this.placeInput.innerText
    if (val) {
      const place = await Place.createWithHome(val)
      this.editingPlace = false
      Router.go(place.url())
    }
  }

  onNewPlace = ref => {
    this.placeInput = ref
    if (ref) {
      ref.focus()
      document.execCommand('selectAll', false, null)
    }
  }

  onNewPlaceKey = e => {
    if (e.which === 13) {
      e.preventDefault()
    }
  }

  clearCreating = () => {
    this.editingPlace = false
  }

  setEditable = place => {
    this.editingPlace = place._id
  }

  setActive = place => {
    this.active = place
  }

  handleShortcuts = (action, event) => {
    console.log('sidebar got', action)
    switch (action) {
      case 'enter':
        event.preventDefault()
        this.createPlace()
      case 'esc':
        event.preventDefault()
        this.clearCreating()
        break
      case 'delete':
        const shouldDelete = confirm(`Delete place ${this.active.title}`)
        if (shouldDelete) {
          this.active.delete()
        }
        break
    }
  }
}

@view({ store: SidebarStore })
export default class Sidebar {
  render({ store }) {
    return (
      <ContextMenu
        options={[
          {
            title: 'Delete',
            onSelect: place => {
              place.delete()
            },
          },
        ]}
      >
        <sidebar $$flex>
          <top>
            <Login />

            <title
              $$row
              $$justify="space-between"
              $$padding={6}
              $$borderBottom={[1, 'dotted', '#eee']}
            >
              <input
                $search
                placeholder="places"
                onChange={e => (store.filter = e.target.value)}
              />
              <Button
                icon="simple-add"
                onClick={() => (store.editingPlace = true)}
              />
            </title>
          </top>

          <content $$draggable>
            <Pane if={store.allPlaces} scrollable collapsable title="me">
              <Shortcuts name="all" handler={store.handleShortcuts}>
                <List
                  controlled
                  items={store.allPlaces}
                  onSelect={place => {
                    store.setActive(place)
                    if (place && place.url) {
                      Router.go(place.url())
                    }
                  }}
                  getItem={(place, index) => {
                    const isEditing =
                      place.create || store.editingPlace === place._id

                    return (
                      <ContextMenu.Target data={place}>
                        <SideBarItem
                          isEditing={isEditing}
                          match={place.url && place.url()}
                          onDoubleClick={() => store.setEditable(place)}
                        >
                          <Text
                            {...isEditing && {
                              contentEditable: true,
                              suppressContentEditableWarning: true,
                              getRef: store.onNewPlace,
                            }}
                          >
                            {place.title}
                          </Text>
                        </SideBarItem>
                      </ContextMenu.Target>
                    )
                  }}
                />
              </Shortcuts>
            </Pane>

            <Pane title="all" collapsable if={store.allPlaces}>
              <List
                controlled
                items={store.allPlaces}
                onSelect={place => {
                  store.setActive(place)
                  if (place && place.url) {
                    Router.go(place.url())
                  }
                }}
                getItem={(place, index) => {
                  const isEditing =
                    place.create || store.editingPlace === place._id

                  return (
                    <SideBarItem
                      isEditing={isEditing}
                      match={place.url && place.url()}
                      onDoubleClick={() => store.setEditable(place)}
                    >
                      <Text
                        {...isEditing && {
                          contentEditable: true,
                          suppressContentEditableWarning: true,
                          getRef: store.onNewPlace,
                        }}
                      >
                        {place.title}
                      </Text>
                    </SideBarItem>
                  )
                }}
              />
            </Pane>
          </content>

          <sidebar if={App.activePage.sidebar}>
            {App.activePage.sidebar}
          </sidebar>
        </sidebar>
      </ContextMenu>
    )
  }

  static style = {
    content: {
      flex: 1,
    },
    sidebar: {
      width: SIDEBAR_WIDTH,
      borderLeft: [1, 'dotted', '#eee'],
      userSelect: 'none',
      flex: 1,
    },
    search: {
      border: 'none',
      margin: ['auto', 0],
      fontSize: 14,
      width: '70%',
      opacity: 0.6,
      '&:hover': {
        opacity: 1,
      },
      '&:focus': {
        opacity: 1,
      },
    },
  }
}
