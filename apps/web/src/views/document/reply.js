import React from 'react'
import { view } from '@mcro/black'
import * as UI from '@mcro/ui'
import DocumentView from '~/views/document'
import Gemstone from '~/views/kit/gemstone'
import timeAgo from 'time-ago'

const { ago } = timeAgo()

@view
export default class Reply {
  render({ doc, embed }) {
    return (
      <message $embed={embed}>
        <doc>
          <DocumentView if={!embed} readOnly noTitle document={doc} />
        </doc>
        <meta>
          <metacontents>
            <before>
              <UI.Title size={0.9} color="#000">
                {doc.authorId}
              </UI.Title>
              <UI.Text size={0.9} color="#999">
                {ago(doc.createdAt)}
              </UI.Text>
            </before>
            <Gemstone id={doc.authorId} marginLeft={10} />
          </metacontents>
        </meta>
      </message>
    )
  }

  static style = {
    message: {
      padding: [25, 20],
      flexFlow: 'row',
      alignItems: 'flex-start',
      position: 'relative',
    },
    metacontents: {
      textAlign: 'right',
      flexFlow: 'row',
      width: 120,
    },
    // leaves room for left bar
    doc: {
      marginLeft: -25,
      flex: 1,
    },
    fake: {
      color: '#333',
      padding: [5, 20],
      lineHeight: 1.2,
    },
    actions: {
      justifyContent: 'space-between',
    },
  }
}
