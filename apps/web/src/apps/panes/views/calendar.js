// @flow
import * as React from 'react'
import { view } from '@mcro/black'
import * as UI from '@mcro/ui'

@view
export default class Calendar extends React.Component<> {
  static defaultProps: {}
  render() {
    return (
      <calendar>
        <UI.Title>Upcoming</UI.Title>
        <content
          $$row
          css={{ width: '100%', overflowX: 'scroll', margin: [-5, 0] }}
        >
          {[
            {
              month: '12',
              day: '7',
              time: '7am',
              description: 'IdeaDrive w/Search team',
            },
            {
              month: '12',
              day: '7',
              time: '10am',
              description: 'OKR Review w/James',
            },
            {
              month: '12',
              day: '7',
              time: '3pm',
              description: 'Planetary fundraiser',
            },
            {
              month: '12',
              day: '8',
              time: '8am',
              description: 'Q4 linkup review',
            },
            {
              month: '12',
              day: '8',
              time: '10:30am',
              description: '1on1 with Dave',
            },
          ].map(
            (item, index) =>
              item.content || (
                <item
                  if={!item.content}
                  key={index}
                  css={{
                    width: '16.6666%',
                    minWidth: 110,
                    padding: [10, 25, 10, 0],
                  }}
                >
                  <date
                    css={{
                      flexFlow: 'row',
                    }}
                  >
                    <time
                      css={{
                        opacity: 0.5,
                        fontWeight: 300,
                        marginLeft: 0,
                      }}
                    >
                      <UI.Text>{item.time}</UI.Text>
                    </time>
                  </date>
                  <description
                    css={{
                      marginTop: 10,
                      fontWeight: 400,
                    }}
                  >
                    <UI.Text>{item.description}</UI.Text>
                  </description>
                </item>
              )
          )}
        </content>
      </calendar>
    )
  }

  static style = {
    section: {
      padding: [8, 10],
      borderBottom: [1, [0, 0, 0, 0.05]],
    },
  }
}
