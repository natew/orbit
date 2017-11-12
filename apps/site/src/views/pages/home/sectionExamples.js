import { view } from '@mcro/black'
import * as React from 'react'
import * as Constants from '~/constants'
import * as View from '~/views'
import * as UI from '@mcro/ui'

const size = 2000

const Nadir = view(({ homeStore }) => (
  <nadir
    css={{
      position: 'fixed',
      width: size,
      height: size,
      borderRadius: size,
      top: 0,
      left: '50%',
      marginLeft: -(size / 4),
      border: [1, Constants.colorMain],
      zIndex: 0,
      transition: 'all ease-in 500ms',
      transform: {
        y: 200 + homeStore.scrollPosition / 3,
      },
    }}
  />
))

const Logo = props => (
  <img
    src={`/logos/${props.name}.svg`}
    css={{
      display: 'inline-block',
      alignSelf: 'center',
      margin: [-18, 0, -12],
      width: 30,
      height: 30,
      // filter: `grayscale(100%) contrast(100%) blur(1px)`,
    }}
  />
)

const Icon = props => (
  <UI.Icon css={{ display: 'inline' }} size={30} {...props} />
)

const Nebula = () => (
  <nebula>
    <cloud
      css={{
        position: 'absolute',
        bottom: -400,
        right: -100,
        width: 1000,
        height: 800,
        background: 'radial-gradient(white, transparent 50%)',
        zIndex: 1,
        opacity: 0.25,
        transform: {
          z: 0,
          scale: 3,
        },
      }}
    />
  </nebula>
)

const Lines = ({ adjustDown }) => (
  <line
    css={{
      position: 'absolute',
      bottom: -adjustDown * 4 + 20,
      right: -440,
      width: 300,
      height: 1,
      background: 'linear-gradient(to left, transparent, red 50%)',
    }}
  >
    <dot
      css={{
        position: 'absolute',
        top: -10,
        left: '50%',
        marginLeft: -30,
        width: 20,
        height: 20,
        border: [2, '#000'],
        background: 'red',
        borderRadius: 100,
      }}
    />
    <upwardsLine
      css={{
        position: 'absolute',
        left: '-100%',
        width: 300,
        height: 1,
        background: 'linear-gradient(to right, transparent 50%, red)',
        transformOrigin: 'bottom right',
        transform: {
          rotate: `${adjustDown * 1.1}deg`,
          // y: -125,
          // x: -50,
        },
      }}
    />
  </line>
)

const dark2 = UI.color(Constants.colorSecondary)
  .darken(0.75)
  .toString()

const OPTS = {
  percentFromTop: 50,
}

@view
export default class SectionExamples {
  render({ setSection, homeStore, blurred }) {
    const makeSection = (key, content, opts = OPTS) => {
      const adjustDown = opts.percentFromTop - 30 * 2
      const isActive = homeStore.activeKey === key
      return (
        <View.SubTitle
          getRef={setSection(key, opts)}
          opacity={isActive ? 1 : 0.32}
          css={{
            transition: 'all ease-in 300ms',
            marginBottom: 50,
            marginTop: 50,
          }}
        >
          {content}
          <Lines key={adjustDown} adjustDown={adjustDown} />
        </View.SubTitle>
      )
    }

    return (
      <UI.Theme name="dark">
        <View.Section
          padded
          css={{ background: `linear-gradient(${dark2}, #000)` }}
        >
          <Nadir if={false} homeStore={homeStore} />
          <View.SectionContent css={{ paddingRight: 430 }}>
            <inner>
              {makeSection(
                'example-1',
                <span>
                  Discover the relevant Slack conversation <Logo name="slack" />{' '}
                  as you discuss opening a ticket <Logo name="jira" />.
                </span>,
                { percentFromTop: 38 }
              )}
              {makeSection(
                'example-2',
                <span>
                  Knowledgebase answers <Logo name="confluence" /> on hand the
                  second your customer asks in Zendesk <Logo name="zendesk" />.
                </span>,
                { percentFromTop: 55 }
              )}
              {makeSection(
                'example-3',
                <span>
                  See the latest numbers in that planning doc{' '}
                  <Logo name="google-drive" /> before you send{' '}
                  <Logo name="google-gmail" />.
                </span>,
                { percentFromTop: 58 }
              )}
              {false &&
                makeSection(
                  'example-4',
                  <span>
                    Michelle already wrote <Logo name="dropbox" /> some notes on
                    that last meeting.
                  </span>,
                  { percentFromTop: 63 }
                )}
              {false &&
                makeSection(
                  'example-5',
                  <span>
                    Be the hero in <Logo name="slack" /> #devops when you see a{' '}
                    <Logo name="github-icon" /> ticket was just opened for the
                    very issue someone just asked about.
                  </span>,
                  { percentFromTop: 70 }
                )}
              <br />
              <br />
              <br />
              <br />
              <div if={false}>
                <View.SubTitle opacity={1}>
                  Orbit is the first ever knowledge assistant that knows
                  <View.Hl color="#000">everything</View.Hl> in your company,
                  and keeps it on hand <View.Hl color="#000">anywhere</View.Hl>{' '}
                  you are.
                </View.SubTitle>
              </div>
            </inner>
          </View.SectionContent>

          <Nebula key={0} />
        </View.Section>
      </UI.Theme>
    )
  }
}
