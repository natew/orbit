import React from 'react'
import { view } from '@mcro/black'
import { User } from '@mcro/models'
import * as UI from '@mcro/ui'
import * as Constants from '~/constants'

@view
export default class UserBar {
  render() {
    return (
      <userbar $$draggable if={User.loggedIn}>
        <UI.Text style={{ marginRight: 10 }} ellipse>
          {User.name}
        </UI.Text>
        <UI.Popover
          theme="light"
          background="transparent"
          distance={10}
          forgiveness={16}
          delay={130}
          target={<UI.Button theme="clear-dark" circular icon="body" />}
          openOnHover
          closeOnClick
        >
          <UI.List
            width={150}
            padding={3}
            elevation={5}
            borderRadius={8}
            itemProps={{
              height: 38,
              fontSize: 14,
              borderWidth: 0,
              borderRadius: 8,
            }}
            items={[
              {
                primary: User.name,
                after: (
                  <UI.Button
                    chromeless
                    icon="power"
                    onClick={() => User.logout()}
                  />
                ),
              },
              {
                primary: 'Settings',
                onClick: () => console.log(),
              },
            ]}
          />
        </UI.Popover>
      </userbar>
    )
  }

  static style = {
    userbar: {
      flexFlow: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: [0, 6],
      height: Constants.HEADER_HEIGHT,
      position: 'relative',
    },
  }
}