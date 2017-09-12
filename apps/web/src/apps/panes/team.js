// @flow
import * as React from 'react'
import { view, watch, Component } from '@mcro/black'
import { Event } from '~/app'
import * as UI from '@mcro/ui'
import type { PaneProps } from '~/types'
import Feed from './views/feed'
import Calendar from './views/calendar'

class BarTeamStore {
  props: PaneProps
  start() {
    this.props.getRef(this)
  }

  @watch
  events: ?Array<Event> = (() => Event.find().sort({ created: 'desc' }): any)

  get results(): Array<Event> {
    return this.events || []
  }
}

type Props = PaneProps & { store: BarTeamStore }

@view({
  store: BarTeamStore,
})
export default class BarTeam extends Component<Props> {
  static defaultProps: Props
  render({ store, paneStore }: Props) {
    return (
      <team>
        <section>
          <UI.Title size={2}>Team {paneStore.data.team}</UI.Title>
        </section>

        <section>
          <Calendar />
        </section>

        <section css={{ flex: 1 }}>
          <Feed
            items={store.results}
            data={paneStore.data}
            activeIndex={paneStore.activeIndex}
          />
        </section>
      </team>
    )
  }

  static style = {
    team: {
      minWidth: 200,
      padding: [5, 15],
      borderRadius: 4,
      flex: 1,
      overflowY: 'scroll',
      zIndex: 100000000,
      position: 'relative',
    },
    section: {
      padding: [8, 10],
      borderBottom: [1, [0, 0, 0, 0.05]],
    },
  }
}
