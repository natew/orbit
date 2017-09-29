import { view } from '@mcro/black'
import * as UI from '@mcro/ui'
import { capitalize, isString } from 'lodash'

@view
export default class Actions {
  render({ actions }) {
    const getName = action => (isString(action) ? action : action.name)

    const shortcutButton = action => {
      return (
        <UI.Text $text $$row key={action}>
          <strong>
            {action}
          </strong>
          <rest>
            {action.slice(1)}
          </rest>
        </UI.Text>
      )
    }

    return (
      <actions $$row>
        {(actions || [])
          .map(action => shortcutButton(capitalize(getName(action))))}
      </actions>
    )
  }

  static style = {
    text: {
      marginLeft: 10,
      marginRight: 5,
    },
    strong: {
      fontWeight: 400,
      opacity: 1,
    },
    rest: {
      display: 'inline',
      opacity: 0.8,
    },
  }
}