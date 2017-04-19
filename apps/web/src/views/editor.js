import { Editor, Raw } from 'slate'
import { Component, view, observable } from 'helpers'
import Hello from './nodes/hello'

export { Raw } from 'slate'

@view
export default class DocEditor extends Component {
  state = {
    val: Raw.deserialize(this.props.content, { terse: true }),
  }

  schema = {
    nodes: {
      hello: Hello,
    },
  }

  componentWillMount() {
    window._activeEditor = {
      destroy: key => {
        const state = this.state.val.transform().removeNodeByKey(key).apply()
        this.onChange(state)
      },
    }
  }

  onChange = val => {
    this.setState({ val })
    if (this.props.onChange) {
      this.props.onChange(val)
    }
  }

  addBlock = name => {
    const newState = this.state.val.transform().insertBlock(name).apply()

    this.onChange(newState)
  }

  render({ onRef }) {
    const editorStyle = {
      color: '#4c555a',
      fontSize: 14,
      lineHeight: 1.9,
      fontFamily: 'Whitney SSm A,Whitney SSm B,Helvetica,Arial',
    }

    return (
      <editor>
        <a onClick={() => this.addBlock('hello')}>add hello</a>
        <Editor
          state={this.state.val}
          style={editorStyle}
          plugins={[]}
          schema={this.schema}
          onKeyDown={this.onKeyDown}
          onChange={this.onChange}
          ref={onRef}
        />
      </editor>
    )
  }
}
