import React from 'react'
import { view, clr } from '@jot/helpers'

@view
export default class Loading {
  render() {
    return <loading>loading</loading>
  }

  static style = {
    loading: {
      alignSelf: 'center',
      textAlign: 'center',
      fontSize: 24,
      opacity: 0.8,
    },
  }

  static theme = {}
}
