// @flow
import React from 'react'
import { view } from '@mcro/black'
import * as UI from '@mcro/ui'
import Gemstone from '~/views/kit/gemstone'
import Router from '~/router'
import { User } from '~/app'
import timeAgo from 'time-ago'

const { ago } = timeAgo()

@view.attach('explorerStore')
@view
export default class DocPageActions {
  render({ explorerStore: { document } }) {
    if (!document || document === null) {
      return null
    }

    const popoverProps = {
      elevation: 2,
      borderRadius: 8,
      background: 'transparent',
      distance: 10,
      forgiveness: 16,
      towards: 'left',
      adjust: [0, 70],
      delay: 290,
      openOnHover: true,
    }

    return (
      <actions
        $$draggable
        css={{
          flexFlow: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: [18, 0, 0],
          marginRight: 12,
          alignSelf: 'flex-end',
          pointerEvents: 'auto',
        }}
      >
        <UI.Button
          size={1.25}
          margin={[0, -9, 0]}
          circular
          borderWidth={1}
          icon="objbear"
          tooltip={document.hasStar() ? 'unfollow' : 'follow'}
          tooltipProps={{
            towards: 'left',
          }}
          highlight={document.hasStar()}
          iconSize={document.hasStar() ? 20 : null}
          onClick={() => document.toggleStar()}
          iconProps={{
            css: {
              transition: 'transform ease-in 80ms',
              scale: document.hasStar() ? 1.1 : 1,
            },
          }}
        />
        <space css={{ paddingTop: 12 }} />
        <UI.Popover
          {...popoverProps}
          target={
            <UI.Button chromeless circular padding={0} size={1.2} glow>
              <Gemstone
                if={document}
                id={document.id}
                size={18}
                css={{
                  margin: 'auto',
                }}
              />
            </UI.Button>
          }
        >
          <UI.Surface width={200} padding={10}>
            <top $$row>
              <left css={{ flex: 1 }}>
                <UI.Text size={0.9}>
                  <strong>Created</strong> {document.createdAt}
                </UI.Text>
                <UI.Text size={0.9}>
                  <strong>Updated</strong> {ago(document.updatedAt)}
                </UI.Text>
              </left>
            </top>

            <space css={{ height: 8 }} />

            <UI.List.Item if={false} icon="back" primary="Revisions" />

            <UI.Form onSubmit={User.org && User.org.inviteMember}>
              <UI.Title>Invite:</UI.Title>
              <UI.Segment>
                <UI.Input
                  name="email"
                  type="email"
                  placeholder="my@friend.com"
                />
                <UI.Input type="submit" icon="3send" />
              </UI.Segment>
            </UI.Form>

            <space css={{ height: 8 }} />

            <UI.Title>Share link</UI.Title>
            <UI.Input value={Router.path} readOnly />
          </UI.Surface>
        </UI.Popover>
        <space css={{ paddingTop: 12 }} />
      </actions>
    )
  }
}
