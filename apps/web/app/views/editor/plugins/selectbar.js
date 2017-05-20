import { view } from '~/helpers'
import { Popover, Segment, Button } from '~/ui'

@view
export default class SelectBar {
  render({ children }) {
    const PAD = 40

    console.log(
      'got em coach',
      Selection.highlightedNode,
      Selection.mouseUpEvent
    )

    return (
      <Popover
        if={Selection.highlightedNode && Selection.mouseUpEvent}
        open
        noArrow
        background
        animation="slide 300ms"
        left={Selection.mouseUpEvent.clientX}
        top={Selection.mouseUpEvent.clientY + PAD}
      >
        <bar $$row>
          <Segment theme="dark" padded if={false}>
            <Button icon="link" tooltip="link" />
            <Button icon="media-image" tooltip="image" />
            <Button icon="textquote" tooltip="quote" />
            <Button icon="code" tooltip="code" />
          </Segment>

          <Segment theme="dark" padded>
            <Button icon="textcolor" />
            <Button icon="textbackground" />
            <Button icon="textbold" />
            <Button icon="textitalic" />
            <Button icon="textquote" />
          </Segment>

          <Segment theme="dark" padded>
            <Button icon="align-left" />
            <Button icon="align-right" />
            <Button icon="align-center" />
            <Button icon="align-justify" />
          </Segment>

          <Segment theme="dark" padded>
            <Button icon="list-bullet" />
            <Button icon="list-number" />
            <Button icon="margin-left" />
            <Button icon="margin-right" />
          </Segment>
        </bar>
      </Popover>
    )
  }
}
