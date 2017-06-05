import React from 'react'
import { view, observable, computed } from '~/helpers'
import { object } from 'prop-types'
import { BLOCKS } from '~/editor/constants'
import { Button, List, Popover } from '~/ui'

export default Component =>
  @view class Node {
    node = null

    get editorStore() {
      return this.props.editor.props.editorStore
    }

    get isRootNode() {
      return (
        this.props.editor.getState().document.getPath(this.props.node.key)
          .length === 1
      )
    }

    setData = data => {
      return this.editorStore.transform(t =>
        t.setNodeByKey(this.props.node.key, { data })
      )
    }

    onClick = (event: MouseEvent) => {
      this.editorStore.selection.setClicked(this.props.node, this.node)
    }

    onMouseEnter = (event: MouseEvent) => {
      this.editorStore.selection.setHovered(this.props.node, this.node)
    }

    @computed get isFocused() {
      const { focusedNode } = this.editorStore.selection
      if (this.editorStore.inline || !this.node) {
        return false
      }
      return focusedNode === this.node
    }

    insert = (type: string, data: Object) => (event: Event) => {
      this.props.editorStore.transform(t => t.insertBlock({ type, data }))
    }

    contextMenu = () => (
      <Popover
        target={
          <Button icon="add" iconSize={9} chromeless color={[0, 0, 0, 0.2]} />
        }
        background="#fff"
        closeOnClickWithin
        openOnClick
        escapable
        noArrow
        shadow
      >
        <List
          items={[
            {
              primary: 'Doc List',
              onClick: this.insert(BLOCKS.DOC_LIST, { type: 'card' }),
            },
            {
              primary: 'Row',
              onClick: () =>
                editorStore.transform(t =>
                  editorStore.allPlugins.row.insertRow(t)
                ),
            },
            { primary: 'Image', onClick: this.insert(BLOCKS.IMAGE) },
            {
              primary: 'Bullet List',
              onClick: this.insert(BLOCKS.UL_LIST),
            },
            {
              primary: 'Ordered List',
              onClick: this.insert(BLOCKS.OL_LIST),
            },
          ]}
        />
      </Popover>
    )

    render() {
      const { node, editor, onFocus } = this.props
      const isRoot = !this.editorStore.inline && this.isRootNode

      // what is this?
      if (
        this.editorStore.onlyNode &&
        node.type !== this.editorStore.onlyNode &&
        this.isRootNode
      ) {
        return <div />
      }

      const component = (
        <Component
          {...this.props}
          setData={this.setData}
          onChange={editor.onChange}
          editorStore={this.editorStore}
          isRoot={isRoot}
          id={this.id}
        />
      )

      if (!isRoot) {
        return component
      }

      console.log(Component.name, Component.constructor, Component.contextMenu)

      const { selection } = this.editorStore
      const isEditable = selection.isEditable(node)
      const isTitle = selection.isDocTitle(node)

      return (
        <node
          $rootLevel={isRoot}
          $hoverable={!isTitle}
          $focused={!isTitle && this.isFocused}
          ref={this.ref('node').set}
          onClick={this.onClick}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <context>
            {(Component.contextMenu && Component.contextMenu(this.props)) ||
              this.contextMenu()}
          </context>
          {component}
        </node>
      )
    }

    static style = {
      node: {
        display: 'inline-block',
        position: 'relative',
        padding: [0, 18],
        borderLeft: [3, 'transparent'],
        borderRight: [3, 'transparent'],

        '&:hover > context': {
          opacity: 1,
        },
      },
      context: {
        opacity: 0,
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
      },
      rootLevel: {
        // [line-height, margin]
        padding: [0, 40],
      },
      hoverable: {
        '&:hover': {
          borderLeftColor: '#eee',
        },
      },
      focused: {
        borderLeftColor: '#ddd',
        '&:hover': {
          borderLeftColor: '#ddd',
        },
      },
    }
  }
