import { view } from '@mcro/black'
import * as UI from '@mcro/ui'
import { User } from '~/app'

@view({
  store: class LoginStore {
    loggingIn = false
    email = null
    password = null
    error = false

    finish = async ({ email, password }) => {
      this.loggingIn = true
      try {
        await User.loginOrSignup(email, password)
      } catch (e) {
        console.error(e)
      }
      this.loggingIn = false
    }
  },
})
export default class BarLoginPane {
  render({ store }) {
    return (
      <setup>
        <UI.Title size={2}>Login</UI.Title>
        <UI.Form flex $$undraggable onSubmit={store.finish}>
          <UI.Input
            $error={store.error}
            disabled={store.loggingIn}
            name="email"
            getRef={store.ref('email').set}
            placeholder="Email"
          />
          <UI.Input
            disabled={store.loggingIn}
            name="password"
            type="password"
            placeholder="Password"
            getRef={store.ref('password').set}
          />
          <UI.Button icon="raft" tooltip="Forgot password?" />
          <UI.Button type="submit" icon={store.loggingIn ? 'time' : 'lock'}>
            {store.loggingIn ? 'Logging in...' : 'Login'}
          </UI.Button>
        </UI.Form>
      </setup>
    )
  }

  static style = {
    setup: {
      padding: 20,
    },
  }
}