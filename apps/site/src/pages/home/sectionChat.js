import { view } from '@mcro/black'
import * as React from 'react'
import * as View from '~/views'
import * as UI from '@mcro/ui'
import * as Constants from '~/constants'
import FakeSlack from './demos/slack'

@view({
  store: class DemosStore {
    active = 0

    sections = [
      {
        title: 'Browser',
      },
      {
        title: 'Slack',
      },
      {
        title: 'Email',
      },
    ]
  },
})
export default class SectionChat extends React.Component {
  render({ store }) {
    return (
      <section css={{ position: 'relative' }}>
        <UI.Theme name="dark">
          <View.Section dark>
            <View.SectionContent fullscreen padRight>
              <View.Slant />
              <View.Title size={3}>Wherever you are</View.Title>
              <View.SubTitle size={3}>
                Ora lives on your desktop and works across many apps.
              </View.SubTitle>
              <UI.Text size={1.5}>
                <row $$row>
                  {store.sections.map(({ title }, index) => (
                    <item key={title} $itemActive={index === store.active}>
                      {title}
                    </item>
                  ))}
                </row>
              </UI.Text>
              <FakeSlack />
            </View.SectionContent>
          </View.Section>
        </UI.Theme>
      </section>
    )
  }

  static style = {
    row: {
      margin: [-15, 0, 20],
    },
    item: {
      padding: [8, 12],
      marginRight: 15,
    },
    itemActive: {
      borderBottom: [2, '#fff'],
    },
  }
}
