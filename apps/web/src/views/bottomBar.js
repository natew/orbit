import { view } from '@mcro/black'
import Gemstone from '~/views/gemstone'
import Router from '~/router'
import { User } from '@mcro/models'
import * as UI from '@mcro/ui'

@view
export default class BottomBar {
  render() {
    return (
      <bottomright
        css={{
          position: 'absolute',
          bottom: 10,
          right: 15,
          zIndex: 100000,
          alignItems: 'flex-end',
        }}
      >
        <above if={User.favoriteDocuments} css={{ flexFlow: 'row', margin: 0 }}>
          {User.favoriteDocuments.map((doc, i) =>
            <UI.Popover
              key={i}
              openOnHover
              background
              borderRadius={5}
              elevation={2}
              target={
                <Gemstone
                  marginLeft={-12}
                  id={doc.id}
                  size={42}
                  onClick={() => Router.go(doc.url())}
                  css={{
                    boxShadow: [[0, 1, 4, [0, 0, 0, 0.15]]],
                    padding: [0, 8],
                  }}
                >
                  <UI.Text color="#fff" size={1.2} ellipse>
                    {doc.title[0]}
                    {doc.title[1]}
                  </UI.Text>
                </Gemstone>
              }
            >
              helo
            </UI.Popover>
          )}
        </above>
      </bottomright>
    )
  }
}
