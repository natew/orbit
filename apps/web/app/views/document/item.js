import { view, observable } from '~/helpers'
import TimeAgo from 'react-timeago'
import Router from '~/router'
import { Icon } from '~/ui'
import React from 'react'
import Editor from '~/views/editor'

@view
export default class DocItem {
  static defaultProps = {
    onSaveTitle: _ => _,
  }

  editor = null

  focus = () => {
    if (this.editor) {
      this.editor.focus()
    }
  }

  onEnter = doc => {
    doc.title = this.title.innerText
    doc.save()
    this.title.blur()
    this.props.onSaveTitle(doc)
  }

  onKeyDown(e) {
    if (e.keyCode === 13) {
      e.preventDefault()
      this.onEnter(this.props.doc)
    }
  }

  navigate = () => Router.go(this.props.doc.url())

  render({
    doc,
    children,
    feed,
    getRef,
    onSaveTitle,
    list,
    slanty,
    editable,
    draggable,
    after,
    height,
    bordered,
    ...props
  }) {
    // hack for now
    getRef && getRef(this)

    if (children) {
      return <doc {...props}>{children}</doc>
    }

    return (
      <doc $$undraggable {...props}>
        <title if={list}>
          {doc.title}
        </title>

        <content if={editable}>
          <Editor getRef={this.ref('editor').set} inline id={doc._id} />
        </content>

        <info onClick={this.navigate}>
          <nick />
          <item $author>{doc.authorId}</item>
          <item>
            <Icon name="link" size={12} color={[0, 0, 0, 0.5]} />
          </item>
          <item>
            <Icon
              name="simple-remove"
              size={8}
              onClick={e => {
                e.stopPropagation()
                doc.delete()
              }}
            />
          </item>
        </info>
      </doc>
    )
  }

  static style = {
    doc: {
      position: 'relative',
      color: '#333',
      background: '#fff',
      overflow: 'hidden',
      margin: [0, 5, 10, 5],
    },
    content: {
      flex: 1,
      padding: 10,
    },
    info: {
      padding: [6, 10],
      flexFlow: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 13,
      cursor: 'pointer',
      color: [0, 0, 0, 0.4],
      position: 'relative',
    },
    item: {
      opacity: 0.5,
      '&:hover': {
        opacity: 1,
      },
    },
    nick: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 30,
      height: 1,
      background: '#eee',
    },
    minibtn: {
      color: '#aaa',
      '&:hover': {
        color: 'purple',
      },
    },
  }

  static theme = {
    bordered: {
      doc: {
        borderRadius: 6,
        border: [1, 'dotted', [0, 0, 0, 0.1]],
      },
    },
    slanty: {
      doc: {
        // warning dont put transition effect here
        // messes up react-move-grid
        '&:hover': {
          borderColor: '#ddd',
          boxShadow: 'inset 0 0 0 1px #ddd',
          transform: {
            // rotate: `-0.5deg`,
            scale: `1.01`,
          },
        },
      },
    },
    feed: {
      doc: {
        width: '100%',
        margin: 0,
        marginBottom: 10,
      },
    },
    editable: {
      doc: {
        height: 200,
      },
    },
    draggable: {
      doc: {
        width: '100%',
        height: '100%',
        margin: 0,
      },
    },
    grid2: {
      doc: {
        width: 'calc(50% - 10px)',
      },
    },
  }
}
