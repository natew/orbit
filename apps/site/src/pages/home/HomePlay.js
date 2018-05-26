import * as React from 'react'
import { view, sleep } from '@mcro/black'
import { HomePlayChats } from './HomePlayChats'
import { HomePlayMessages } from './HomePlayMessages'
import { HomePlayDock } from './HomePlayDock'

let hasAnimated = false

class HomePlayStore {
  animate = false
  async willMount() {
    if (hasAnimated) {
      return
    }
    await sleep(250)
    this.animate = true
    // set done
    await sleep(9000)
    hasAnimated = true
  }
}

@view({
  store: HomePlayStore,
})
export class HomePlay extends React.Component {
  render({ store }) {
    console.log('render play', hasAnimated)
    return (
      <>
        <illus>
          <HomePlayDock animate={store.animate} hasAnimated={hasAnimated} />
          <HomePlayChats animate={store.animate} hasAnimated={hasAnimated} />
        </illus>
        <HomePlayMessages animate={store.animate} hasAnimated={hasAnimated} />
      </>
    )
  }

  static style = {
    illus: {
      position: 'relative',
      height: '100%',
      width: '90%',
      margin: 'auto',
      overflow: 'hidden',
      zIndex: 0,
    },
  }
}
