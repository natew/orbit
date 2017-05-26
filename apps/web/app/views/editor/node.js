import React from 'react'
import { view, observable, computed } from '~/helpers'
import { object } from 'prop-types'
import { BLOCKS } from '~/views/editor/constants'
import App from '@jot/models'

export default Component => @view class Node extends React.Component {
  static contextTypes = {
    stores: object,
  }

  get editorStore() {
    return this.context.stores.editorStore
  }

  setData = data => {
    const { node, editor } = this.props
    const next = editor
      .getState()
      .transform()
      .setNodeByKey(node.key, { data })
      .apply()
    editor.onChange(next)
  }

  node = null

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

  get isRootNode() {
    return (
      this.props.editor.getState().document.getPath(this.props.node.key)
        .length === 1
    )
  }

  render() {
    const { node, editor, onFocus } = this.props
    const isRoot = !this.editorStore.inline && this.isRootNode

    const component = (
      <Component
        {...this.props}
        setData={this.setData}
        onChange={editor.onChange}
        editorStore={this.editorStore}
        id={this.id}
      />
    )

    if (!isRoot) {
      return component
    }

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
    },
    rootLevel: {
      // [line-height, margin]
      padding: [0, 40],
    },
    hoverable: {
      '&:hover': {
        background: '#fcfcfc',
      },
    },
    focused: {
      borderLeftColor: 'blue',
    },
  }
}
