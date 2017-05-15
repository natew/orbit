import { view, store } from '~/helpers'
import { Popover, Segment, Button } from '~/ui'
import { findDOMNode } from 'slate'
import Selection from '../stores/selection'

@view class ToolbarPane {
  render({ children }) {
    const PAD = 40

    return (
      <pane>
        {children}
        <Popover
          if={Selection.node}
          open
          noArrow
          bg
          left={Selection.mouseUpEvent.clientX}
          top={Selection.mouseUpEvent.clientY - PAD}
        >
          <bar $$row>
            <Segment padded>
              <Button icon="textcolor" />
              <Button icon="textbackground" />
              <Button icon="textbold" />
              <Button icon="textitalic" />
              <Button icon="textquote" />
            </Segment>

            <Segment padded>
              <Button icon="align-left" />
              <Button icon="align-right" />
              <Button icon="align-center" />
              <Button icon="align-justify" />
            </Segment>

            <Segment padded>
              <Button icon="list-bullet" />
              <Button icon="list-number" />
              <Button icon="margin-left" />
              <Button icon="margin-right" />
            </Segment>
          </bar>
        </Popover>
      </pane>
    )
  }

  static style = {
    pane: {
      flex: 1,
    },
  }
}

export default {
  onSelect(event, { selection }, state, editor) {
    if (selection.startOffset === selection.endOffset) {
      Selection.clear()
      return
    }
    const selectedTextKey = selection.anchorKey
    const selectedTextNode = state.document.findDescendantDeep(
      x => x.key === selectedTextKey
    )
    const node = findDOMNode(selectedTextNode)
    Selection.node = node
  },
  render({ children }) {
    return (
      <ToolbarPane>
        {children}
      </ToolbarPane>
    )
  },
}
