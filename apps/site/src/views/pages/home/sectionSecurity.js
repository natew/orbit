import * as React from 'react'
import * as View from '~/views'
import * as UI from '@mcro/ui'

const background = '#111'
const bgLight = UI.color(background).lighten(0.5)

export default props => (
  <UI.Theme name="dark">
    <View.Section css={{ background, zIndex: 100000, padding: [100, 0] }}>
      <slant
        css={{
          position: 'absolute',
          top: -50,
          background,
          left: -300,
          right: -300,
          height: 100,
          zIndex: 1200000,
          boxShadow: [[0, -10, 20, [0, 0, 0, 0.05]]],
          transform: {
            rotate: '-1deg',
          },
        }}
      />
      <bottomSlant
        css={{
          position: 'absolute',
          bottom: -20,
          background: bgLight,
          left: -300,
          right: -300,
          height: 100,
          zIndex: 1200000,
          boxShadow: [[0, 20, 20, [0, 0, 0, 0.025]]],
          transform: {
            rotate: '-1deg',
          },
        }}
      />

      <bg
        $$fullscreen
        css={{
          background: `linear-gradient(${background}, ${bgLight})`,
        }}
      />

      <View.SectionContent padRight padBottom>
        <after
          css={{
            position: 'absolute',
            top: 0,
            right: -100,
            bottom: 0,
            justifyContent: 'center',
          }}
        >
          <UI.Icon color="#000" opacity={0.8} size={480} name="lock" />
        </after>
        <View.Title getRef={props.setSection(2)} size={3}>
          The No-Cloud Infrastructure
        </View.Title>
        <View.Text size={3.5} fontWeight={200} opacity={0.7}>
          In order to work well, we invented a new model: one that keeps you
          safe.
        </View.Text>

        <View.Text size={2} fontWeight={200}>
          How do we do that?
        </View.Text>

        <View.Text size={2} fontWeight={200}>
          Your data is yours, we never touch it.
        </View.Text>
        <View.Text size={2} fontWeight={200}>
          <span css={{ background: [255, 255, 255, 0.055], padding: 3 }}>
            This allows us to be ambitious from day one without compromise.
          </span>{' '}
          Our interests are aligned with yours: no data breaches, permissions
          mixups, or complicated on-premise software.
        </View.Text>
      </View.SectionContent>
    </View.Section>
  </UI.Theme>
)
