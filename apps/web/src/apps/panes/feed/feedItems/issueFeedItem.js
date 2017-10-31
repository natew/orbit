import * as React from 'react'
import { view } from '@mcro/black'
import * as UI from '@mcro/ui'
import { format } from '~/apps/panes/task/helpers'
import TaskMain from '~/apps/panes/task'
import Commit from './views/commit'

const VERB_MAP = {
  PushEvent: () => 'pushed',
  CreateEvent: () => 'created branch',
  IssueCommentEvent: () => 'commented',
  ForkEvent: () => 'forked',
  PullRequestEvent: ({ action }) => `${action} a pull request`,
  WatchEvent: ({ action }) => `${action} watching`,
  IssuesEvent: () => 'created issue',
  DeleteEvent: () => 'deleted',
}

@view
export default class IssueFeedItem {
  getBody(event) {
    const { payload } = event.data
    switch (event.action) {
      case 'IssuesEvent':
        return (
          <TaskMain
            paneStore={{
              activeIndex: 1,
              data: { ...event, data: payload.issue },
            }}
          />
        )
      case 'PushEvent':
        return (
          <content if={payload.commits}>
            <main>
              {payload.commits.map(commit => (
                <commit key={commit.sha}>
                  <UI.Text html={format(commit.message)} />
                </commit>
              ))}
            </main>
            <cards
              css={{
                overflow: 'hidden',
                justifyContent: 'flex-start',
              }}
            >
              <header
                css={{
                  flexFlow: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  width: '100%',
                  marginBottom: 10,
                }}
              >
                <nav if={false} css={{ flexFlow: 'row' }}>
                  <UI.Icon name="arrowminleft" color="white" />
                  <UI.Icon name="arrowminright" color="white" />
                </nav>
              </header>
              <UI.Surface
                css={{
                  position: 'absolute',
                  top: 0,
                  width: 500,
                  right: -400,
                }}
                background="#fff"
                flex={1}
                borderRadius={5}
                padding={15}
              >
                <Commit sha={payload.commits[0].sha} />
              </UI.Surface>
            </cards>
          </content>
        )
      case 'IssueCommentEvent':
        return (
          <content if={payload.comment}>
            <UI.Text html={format(payload.comment.body)} />
          </content>
        )
    }
    return null
  }

  extraInfo(event) {
    const { data } = event
    const { payload } = data
    const branch = payload.ref ? payload.ref.replace('refs/heads/', '') : ''
    switch (event.action) {
      case 'DeleteEvent':
        return (
          <UI.Text>
            branch <strong>{branch}</strong>{' '}
          </UI.Text>
        )
      case 'PushEvent':
        return (
          <UI.Text>
            {payload.commits.length} commits to branch{' '}
            <strong>
              <a href={`https://github.com/${data.repo.name}/tree/${branch}`}>
                {branch}
              </a>
            </strong>{' '}
          </UI.Text>
        )
    }
  }

  render({ children, event }) {
    const { actor } = event.data
    const body = this.getBody(event)
    const extraInfo = this.extraInfo(event)
    if (typeof children === 'function') {
      return children({
        body,
        extraInfo,
        avatar: actor.avatar_url,
        name: actor.login,
        verb: VERB_MAP[event.action]
          ? VERB_MAP[event.action](event)
          : `NO ACTION FOR ${event.action}`,
      })
    }
    return body
  }

  static style = {
    content: {
      flex: 1,
      padding: [0, 20],

      '& span': {
        display: 'flex',
      },
    },
  }
}