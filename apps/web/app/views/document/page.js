import { view } from '~/helpers'
import { Page, Button } from '~/views'
import Router from '~/router'
import TimeAgo from 'react-timeago'
import Editor from '~/views/editor'
import { Document } from 'models'

// cmd + t
@view({
  store: class PageStore {
    doc = Document.get(this.props.id)
    editor = null

    onKeyDown = e => {
      if (e.metaKey && e.which === 84) {
        this.editor.blur()
        setTimeout(() => {
          window._toggleCommander()
        }, 50)
      }
    }
  },
})
export default class DocumentPage {
  render({ store, noActions, noSide }) {
    const { doc } = store

    if (!doc) {
      return null
    }

    return (
      <Page
        header
        sidebar={
          <side $$flex>
            side ;alala
          </side>
        }
        /*
        actions={
          !noActions && [
            <Button>collab</Button>,
            <Button onClick={doc.togglePrivate}>
              make {doc.private ? 'public' : 'private'}
            </Button>,
          ]
        }
        */
      >
        <content $$flex $$row>
          <main $$flex={2}>
            <docarea $$draggable>
              <Editor
                onKeyDown={store.onKeyDown}
                doc={doc}
                getRef={el => {
                  store.editor = el
                }}
                id={doc._id}
              />
            </docarea>

            <met if={!noSide}>
              <ago>
                <TimeAgo if={false} minPeriod={20} date={doc.updatedAt} />
              </ago>
              <places $$row if={doc.places}>
                places:
                {(doc.places || [])
                  .map(name => <place key={name}>{name}</place>)}
              </places>
            </met>
          </main>
        </content>
      </Page>
    )
  }

  static style = {
    ago: {
      flexFlow: 'row',
    },
    main: {
      padding: 15,
      position: 'relative',
    },
    met: {
      flexFlow: 'row',
      justifyContent: 'space-between',
    },
    docarea: {
      flex: 1,
    },
  }
}
