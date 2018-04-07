import { view, react } from '@mcro/black'
import * as UI from '@mcro/ui'
import Overdrive from '@mcro/overdrive'

const Text = props => (
  <UI.Text size={1.1} css={{ marginBottom: 10 }} {...props} />
)

@view({
  store: class OrbitCardStore {
    get isSelected() {
      return this.props.appStore.selectedIndex === this.props.index
    }

    @react({ delayValue: true })
    wasSelected = [() => this.isSelected, _ => _]
  },
})
export default class OrbitCard {
  render({ result, index, theme, getHoverProps, store }) {
    const { isSelected, wasSelected } = store
    const shouldResizeText = wasSelected !== isSelected
    let cardWrapStyle = {
      height: 200,
    }
    if (isSelected) {
      cardWrapStyle = {
        ...cardWrapStyle,
        height: 400,
      }
    }
    const textProps = {
      ellipse: true,
      measure: shouldResizeText,
      style: {
        flex: 1,
      },
    }
    return (
      <Overdrive id={`${result.id}`}>
        <cardWrap css={cardWrapStyle} {...getHoverProps({ result, id: index })}>
          <card
            css={{
              background: isSelected ? theme.highlight.color : 'transparent',
            }}
          >
            <Text
              size={1.35}
              ellipse={2}
              fontWeight={200}
              css={{ marginBottom: 8 }}
            >
              {result.title}
            </Text>
            <content css={{ flex: 1, opacity: 0.8, overflow: 'hidden' }}>
              <Text {...textProps} css={{ maxHeight: '100%' }}>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione
                modi optio at neque ducimus ab aperiam dolores nemo? Quod quos
                nisi molestias velit reprehenderit veniam dicta, voluptatum vel
                voluptas a? Lorem ipsum dolor sit amet consectetur adipisicing
                elit. Ratione modi optio at neque ducimus ab aperiam dolores
                nemo? Quod quos nisi molestias velit reprehenderit veniam dicta,
                voluptatum vel voluptas a? Lorem ipsum dolor sit amet
                consectetur adipisicing elit. Ratione modi optio at neque
                ducimus ab aperiam dolores nemo? Quod quos nisi molestias velit
                reprehenderit veniam dicta, voluptatum vel voluptas a?
              </Text>
            </content>
            <Text opacity={0.5} size={0.9} css={{ marginBottom: 3 }}>
              via{' '}
              <UI.Icon
                name="mail"
                size={10}
                css={{ display: 'inline-block' }}
              />
              &nbsp;
              <UI.Date>{result.bitUpdatedAt}</UI.Date>
            </Text>
          </card>
        </cardWrap>
      </Overdrive>
    )
  }

  static style = {
    cardWrap: {
      padding: [0, 8, 10],
      position: 'relative',
    },
    card: {
      flex: 1,
      borderRadius: 8,
      padding: 12,
      overflow: 'hidden',
    },
  }
}
