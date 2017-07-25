import React from 'react'
import { view } from '@mcro/black'
import * as UI from '@mcro/ui'
import { Editor } from 'slate'
import RightArrow from '~/views/kit/rightArrow'
import Router from '~/router'
import ExplorerStore from './explorerStore'

const FONT_SIZE = 15

const $text = {
  fontSize: FONT_SIZE,
  color: 'rgba(0,0,0,.8)',
  fontWeight: 400,
  display: 'flex',
  flexFlow: 'row',
  alignItems: 'center',
}

const $arrow = {
  opacity: 0.4,
  margin: [0, -4],
  transform: {
    scale: 0.8,
    y: -1,
  },
}

@view
class Para {
  render({ children }) {
    return (
      <text style={$text}>
        {children}
      </text>
    )
  }
}

const schema = {
  nodes: {
    paragraph: props => <Para {...props} />,
    item: props => <Item {...props} />,
  },
}

const short = x => (x.length > 17 ? x.slice(0, 15) + '...' : x)

@view.attach('explorerStore')
@view
class Item {
  render({ explorerStore, node }) {
    const name = node.data.get('name')
    const doc = node.data.get('doc')
    const { document } = explorerStore.editorState
    const nextKey = document.getNextSibling(node.key).key
    const isLast = document.nodes.last().nodes.last().key === nextKey
    const selected = explorerStore.selectedItemKey === node.key
    const hideArrow = !explorerStore.isCreatingNew && isLast
    const hasIcon = doc && doc.type === 'inbox'
    const icon = 'paper'

    const btnProps = {
      $btn: true,
      $active: selected,
      chromeless: true,
      icon: hasIcon ? icon : '',
      spaced: true,
      size: 1,
      height: 24,
      padding: [0, 5],
      margin: [0, 2, 0, -4],
      fontSize: FONT_SIZE,
      highlight: selected,
      color: [0, 0, 0, 0.8],
      style: $text,
      glowProps: {
        color: [255, 255, 255, 0.5],
        opacity: 1,
        zIndex: -1,
        backdropFilter: 'contrast(200%)',
      },
    }

    return (
      <span>
        <inner contentEditable={false}>
          <UI.Button
            {...btnProps}
            onClick={() =>
              doc ? Router.go(doc.url()) : explorerStore.onItemClick(node.key)}
          >
            {short(name)}
          </UI.Button>
          <RightArrow if={!hideArrow} css={$arrow} animate={isLast} />
        </inner>
        <block contentEditable={false} $last={isLast} $hasIcon={hasIcon}>
          {name}
        </block>
      </span>
    )
  }

  static style = {
    span: {
      display: 'inline',
      position: 'relative',
      marginLeft: -4,
    },
    div: {
      position: 'relative',
    },
    btn: {
      marginLeft: -10,
      marginRight: 10,
    },
    block: {
      opacity: 0,
      background: 'green',
      pointerEvents: 'none',
      display: 'inline',
      paddingRight: 26,
      // paddingLeft: 5,
    },
    last: {
      // marginLeft: -4,
    },
    hasIcon: {
      paddingRight: 40,
    },
    active: {
      background: 'rgba(0,0,255,.05)',
    },
    inner: {
      position: 'absolute',
      flexFlow: 'row',
      left: 0,
      top: -3,
    },
  }
}

@view.attach('rootStore')
@view.provide({
  explorerStore: ExplorerStore,
})
export default class Explorer {
  render({ explorerStore }) {
    explorerStore.version

    return (
      <bar $blurred={!explorerStore.focused} $focused={explorerStore.focused}>
        <UI.Button
          iconSize={14}
          margin={6}
          marginTop={5}
          chromeless
          glow={false}
          circular
          disabled={Router.path === '/'}
          color={[0, 0, 0, 0.4]}
          height={24}
          icon="envir_home"
          onClick={() => Router.go('/')}
        />
        <RightArrow if={Router.path !== '/'} css={$arrow} />
        <space css={{ width: 10 }} />
        <Editor
          placeholder={'search or create docs'}
          state={explorerStore.editorState}
          ref={explorerStore.ref('inputNode').set}
          onKeyDown={explorerStore.onKeyDown}
          onFocus={explorerStore.onFocus}
          onBlur={explorerStore.onBlur}
          onChange={explorerStore.onChange}
          schema={schema}
          style={{ width: '100%', marginBottom: 1 }}
        />

        <fade
          $$fullscreen
          css={{
            left: 'auto',
            width: 50,
            background: 'linear-gradient(left, transparent, #fff)',
          }}
        />
      </bar>
    )
  }

  static style = {
    bar: {
      overflow: 'hidden',
      position: 'relative',
      height: 38,
      flexFlow: 'row',
      flex: 1,
      alignItems: 'center',
      borderBottom: [1, '#e0e0e0', 'dotted'],
    },
    focused: {
      borderColor: '#ddd',
    },
    blurred: {
      // background: '#f2f2f2',
      // borderBottom: '1px solid #eee',
    },
  }
}