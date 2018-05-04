import * as React from 'react'
import { view, react } from '@mcro/black'
import * as UI from '@mcro/ui'
import { Bit } from '@mcro/models'
import OrbitCard from './orbitCard'
import Masonry from '~/views/masonry'
import OrbitDockedPane from './orbitDockedPane'

const findType = (integration, type, skip = 0) =>
  Bit.findOne({
    skip,
    take: 1,
    where: {
      type,
      integration,
    },
    relations: ['people'],
    order: { bitCreatedAt: 'DESC' },
  })

class OrbitHomeStore {
  @react({ immediate: true })
  setGetResults = [
    () => this.props.isActive,
    () => {
      this.props.appStore.setGetResults(() => this.results)
    },
  ]

  @react({
    defaultValue: [],
  })
  results = async () => {
    return (await Promise.all([
      findType('slack', 'conversation'),
      findType('slack', 'conversation', 1),
      findType('slack', 'conversation', 2),
      findType('google', 'document'),
      findType('google', 'mail'),
      findType('google', 'mail', 1),
      findType('slack', 'conversation'),
      findType('slack', 'conversation'),
      findType('slack', 'conversation'),
    ])).filter(Boolean)
  }
}

@UI.injectTheme
@view({
  store: OrbitHomeStore,
})
export default class OrbitHome {
  render({ store }) {
    return (
      <OrbitDockedPane name="home">
        <Masonry>
          {store.results.map((bit, index) => (
            <OrbitCard
              pane="summary"
              key={`${bit.id}${index}`}
              index={index}
              bit={bit}
              total={store.results.length}
              hoverToSelect
              expanded
            />
          ))}
        </Masonry>
      </OrbitDockedPane>
    )
  }
}
