import { node, view } from '~/helpers'

@node
@view
export default class Todo {
  toggle = () => {
    const { node: { data }, onChange } = this.props

    const next = data.set('done', !data.get('done'))

    onChange(next)
  }

  render({ node, children, ...props }) {
    const { data } = node

    return (
      <check contentEditable={false}>
        <span>
          <input
            type="checkbox"
            checked={data.get('done')}
            onChange={this.toggle}
          />
        </span>
        <span $content contentEditable suppressContentEditableWarning>
          {children}
        </span>
      </check>
    )
  }

  static style = {
    check: {
      flexFlow: 'row',
      alignItems: 'center',
      marginTop: 0,
    },
    content: {
      flex: 1,
      marginLeft: 5,
    },
  }
}
