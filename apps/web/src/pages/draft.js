import React from 'react'
import { view } from '@mcro/black'
import Page from './page'
import Draft from '~/views/inbox/draft'

@view.attach('rootStore')
@view
export default class HomePage {
  render({ rootStore }) {
    if (!rootStore.document) {
      return <null>not found</null>
    }

    return (
      <Page>
        <Draft
          $draft
          isReply
          parentId={rootStore.document.id}
          placeholder="Add your reply..."
        />
      </Page>
    )
  }
}
