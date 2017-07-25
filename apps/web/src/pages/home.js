import React from 'react'
import { view } from '@mcro/black'
import { User } from '~/app'
import DocumentPage from './document'

@view
export default class HomePage {
  async componentDidMount() {
    if (User.home === null) {
      await User.createOrg('myneworg')
      console.log('created new org for user')
    }
  }

  render() {
    if (!User.loggedIn) {
      return <center $$centered>login plz</center>
    }

    if (User.home === null) {
      return <null>weird no org</null>
    }

    return <DocumentPage {...this.props} />
  }
}