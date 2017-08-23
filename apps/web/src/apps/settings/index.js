import React from 'react'
import { view } from '@mcro/black'
import { CurrentUser } from '~/app'
import * as UI from '@mcro/ui'
import Integrations from './integrations'
import Setup from './setup'

@view({
  store: class SettingsStore {
    activeItem = null
  },
})
export default class SettingsPage {
  render({ store }) {
    if (!CurrentUser.loggedIn) {
      return <center $$centered>login plz</center>
    }

    const itemProps = {
      size: 1.2,
      glow: false,
      hoverable: true,
      fontSize: 26,
      padding: [0, 10],
      height: 40,
    }

    return (
      <settings>
        <UI.Title size={3}>Settings</UI.Title>

        <content>
          <sidebar>
            <Integrations
              onSelect={store.ref('activeItem').set}
              itemProps={itemProps}
            />
          </sidebar>
          <main>
            <Setup if={store.activeItem} item={store.activeItem} />
          </main>
        </content>
      </settings>
    )
  }

  static style = {
    settings: {
      padding: 20,
    },
    content: {
      flexFlow: 'row',
      flex: 1,
    },
    sidebar: {
      width: 200,
    },
    main: {
      flex: 1,
    },
  }
}
