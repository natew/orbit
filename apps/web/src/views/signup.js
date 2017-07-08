// @flow
import React from 'react'
import { view, schema, string } from '@mcro/black'
import { User, Org } from '@mcro/models'
import * as UI from '@mcro/ui'
import Login from './sidebar/login'

@view({
  store: class SignupStore {
    errors = null

    // wrap to avoid mobx action wrap because validator has weird api
    helpers = {
      validator: schema({
        company: string.minlen(2),
        name: string.minlen(2),
        email: string
          .minlen(5)
          .match(
            /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
          ),
        password: string.minlen(7),
      }),
    }

    handleSubmit = async fields => {
      console.log('submitting', fields)
      const passes = this.helpers.validator(fields)
      if (!passes) {
        this.errors = this.helpers.validator.errors
        return
      }

      try {
        await User.signup(fields.email, fields.password)
      } catch (e) {
        this.errors = [{ message: `Error signing up user: ${e.message}` }]
      }

      if (this.errors) {
        return
      }

      try {
        const org = await Org.create({
          title: fields.name,
          admins: [User.id],
        })

        console.log('done signed up', org)
      } catch (e) {
        console.log('err', e)
        this.errors = [{ message: `Error creating company: ${e.message}` }]
      }

      if (!this.errors) {
        console.log('NICE JOB DUDE')
      }
    }

    play = node => {
      if (node) {
        node.play()
      }
    }
  },
})
export default class Signup {
  render({ store }) {
    // !User.org

    return (
      <signup if={!User.loggedIn} $$fullscreen $$draggable>
        <video
          if={false}
          src="https://cash-f.squarecdn.com/videos/cash_site_loop.mp4"
          playsInline
          ref={store.play}
          muted
          controls="false"
          loop
          css={{
            position: 'absolute',
            top: '-15%',
            left: '-15%',
            right: 0,
            bottom: 0,
            width: '150%',
            alignSelf: 'center',
            opacity: 0.1,
          }}
        />
        <UI.Glint size={3} borderRadius={5} />
        <UI.Glow
          draggable
          color={[255, 255, 255]}
          opacity={0.3}
          full
          blur={80}
          scale={1.2}
          show
          resist={62}
          backdropFilter="contrast(150%) saturation(150%) brightness(150%)"
        />
        <UI.Theme name="clear">
          <inner $$margin="auto">
            <UI.Form
              onSubmit={store.handleSubmit}
              $$draggable
              $$centered
              $form
              padding={15}
              margin="auto"
            >
              {store.errors && JSON.stringify(store.errors)}
              <UI.Title $$centered>Welcome to Jot</UI.Title>
              <UI.Text size={1.2} color={[0, 0, 0, 0.4]}>
                Lets get you signed up
              </UI.Text>
              <br />
              <UI.PassProps
                row
                placeholderColor="#444"
                labelStyle={{ width: 110 }}
                size={1.2}
              >
                <UI.Field label="Company" placeholder="" />
                <UI.Field label="Icon">
                  {[1, 2, 3, 4, 5].map(i =>
                    <UI.Circle
                      background="linear-gradient(-20deg, red, yellow)"
                      marginRight={5}
                      key={i}
                    />
                  )}
                </UI.Field>
                <hr />
                <UI.Field label="Name" placeholder="" />
                <UI.Field label="Email" placeholder="" />
                <UI.Field label="Password" placeholder="" />
              </UI.PassProps>
              <space $$height={20} />
              <UI.Button
                iconAfter
                icon="arrowri"
                type="submit"
                theme="dark"
                alignSelf="flex-end"
                size={1.2}
              >
                Signup
              </UI.Button>
            </UI.Form>

            <UI.Theme name="clear">
              <login
                $$row
                $$centered
                css={{
                  position: 'absolute',
                  bottom: 10,
                  right: 0,
                  left: 0,
                  opacity: 0.5,
                  '&:hover': {
                    opacity: 1,
                  },
                }}
              >
                Or login to your account:&nbsp;
                <Login />
              </login>
            </UI.Theme>
          </inner>
        </UI.Theme>
      </signup>
    )
  }

  static style = {
    signup: {
      background: 'radial-gradient(#eee, #ddd)',
      zIndex: 11,
    },
    form: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 40,
    },
  }
}
