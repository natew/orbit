// @flow
import React from 'react'
import { view, watch } from '@mcro/black'
import * as UI from '@mcro/ui'
import DocumentView from '~/views/document'
import { User, Document } from '@mcro/models'
import Page from '~/views/page'
import Inbox from '~/views/inbox'
import Children from '~/explorer/children'

@view.attach('explorerStore')
@view
class Actions {
  render({ explorerStore }) {
    const document = explorerStore.document

    if (!document || document === null) {
      return null
    }

    if (typeof document.hasStar !== 'function') {
      log('hmr caused a bad thing')
      return null
    }

    log('render actions')

    const starred = document.hasStar()
    const itemProps = {
      size: 1.5,
      chromeless: true,
      tooltipProps: {
        towards: 'left',
      },
    }

    return (
      <actions $$draggable>
        <UI.Button
          {...itemProps}
          icon="fav3"
          tooltip={starred ? 'Unfollow' : 'Follow'}
          highlight={starred}
          onClick={document.toggleStar}
        />
        <UI.Button
          {...itemProps}
          chromeless
          icon="design-f"
          tooltip="Threads"
          highlight={explorerStore.showDiscussions}
          onClick={explorerStore.ref('showDiscussions').toggle}
          badge={1}
        />
        <UI.Popover
          elevation={3}
          borderRadius={8}
          background="transparent"
          distance={10}
          forgiveness={16}
          towards="left"
          delay={150}
          target={
            <UI.Button {...itemProps} opacity={0.5} chromeless icon="dot" />
          }
          openOnHover
          closeOnClick
        >
          <UI.List
            width={150}
            padding={3}
            itemProps={{
              height: 32,
              fontSize: 14,
              borderWidth: 0,
              borderRadius: 8,
            }}
            items={[
              {
                icon: 'bell',
                primary: 'Ping +3',
                onClick: () => console.log(),
              },
              {
                icon: 'gear',
                primary: 'Settings',
                onClick: () => console.log(),
              },
            ]}
          />
        </UI.Popover>
      </actions>
    )
  }

  static style = {
    actions: {
      position: 'absolute',
      top: 50,
      right: 10,
      height: 110,
      alignItems: 'flex-end',
      zIndex: 1000,
      justifyContent: 'space-between',
      // flexFlow: 'row',
    },
  }
}

class DocPageStore {
  forceEdit = false
  showDiscussions = false

  get editing() {
    return this.forceEdit || (User.loggedIn && !User.user.hatesToEdit)
  }
  toggleEdit = () => {
    this.forceEdit = !this.forceEdit
  }
}

@view.attach('explorerStore')
@view({
  docStore: DocPageStore,
})
export default class DocumentPage {
  extraRef = null

  render({ docStore, explorerStore }: { docStore: DocPageStore }) {
    const { document } = explorerStore

    if (document === undefined) {
      return <null />
    }
    if (!document) {
      return <UI.Placeholder size={2}>Doc 404</UI.Placeholder>
    }

    return (
      <Page>
        <Page.Actions if={false}>
          <UI.Button
            onClick={docStore.ref('showInbox').toggle}
            highlight={docStore.showInbox}
            chromeless
            icon="message"
          >
            Threads
          </UI.Button>
        </Page.Actions>
        <Actions />
        <Inbox
          if={explorerStore.showDiscussions}
          document={explorerStore.document}
        />
        <docpagecontent>
          <DocumentView
            document={document}
            onKeyDown={docStore.onKeyDown}
            showCrumbs
            showChildren
            isPrimaryDocument
          />
          <children>
            <Children documentStore={docStore} />
          </children>
        </docpagecontent>
      </Page>
    )
  }

  static style = {
    docpagecontent: {
      flex: 1,
      overflow: 'hidden',
      paddingRight: 30,
      paddingTop: 32,
      flexFlow: 'row',
    },
    children: {
      width: '30%',
    },
  }
}
