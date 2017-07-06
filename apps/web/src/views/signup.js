// @flow
import React from 'react'
import { view } from '@mcro/black'
import { User } from '@mcro/models'
import * as UI from '@mcro/ui'

@view
export default class Signup {
  render() {
    return (
      <signup $$fullscreen if={!User.loggedIn} $$draggable>
        <UI.Glow
          color={[255, 255, 255]}
          opacity={0.3}
          full
          blur={40}
          scale={1.15}
          show
          resist={95}
          backdropFilter="contrast(150%) saturation(150%) brightness(150%)"
        />
        <UI.Theme name="light" if={!User.loggedIn}>
          <inner $$flex>
            <UI.Form $$draggable $form padding={15}>
              <UI.Title>welcome</UI.Title>
              <UI.PassProps
                row
                placeholderColor="#444"
                labelStyle={{ width: 110 }}
              >
                <UI.Field label="Company" placeholder="" />
                <UI.Field label="Name" placeholder="" />
                <UI.Field label="Email" placeholder="" />
                <UI.Field label="Password" placeholder="" />
              </UI.PassProps>
              <space $$height={20} />
              <UI.Button theme="dark" size={1.5}>
                Signup
              </UI.Button>
            </UI.Form>
          </inner>
        </UI.Theme>
      </signup>
    )
  }

  static style = {
    signup: {
      background: '#ccc',
      zIndex: 11,
    },
    form: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }
}
