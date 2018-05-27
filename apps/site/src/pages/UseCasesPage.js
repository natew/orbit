import { Header, Footer, Join } from '~/components'
import {
  Border,
  P,
  P2,
  LeftSide,
  Title,
  SmallTitle,
  SubTitle,
  SubSubTitle,
  RightSide,
  Callout,
  FadedArea,
  Glow,
  Notification,
  HalfSection,
  Section,
  Slant,
} from '~/views'
import SectionContent from '~/views/sectionContent'
import * as React from 'react'
import * as UI from '@mcro/ui'
import { view } from '@mcro/black'
import * as Constants from '~/constants'
import Media from 'react-media'
import profileImg from '~/../public/screen-profile.png'
import chatImg from '~/../public/chat.svg'
import { scrollTo } from '~/helpers'

export const ChatIcon = props => (
  <img src={chatImg} width={`${120}px`} {...props} />
)

@view
class UseCasesIntro extends React.Component {
  render() {
    return (
      <Media query={Constants.screen.large}>
        {isLarge => (
          <Section>
            <SectionContent padded fullscreen css={{ marginTop: -850 }}>
              <Slant
                slantBackground={Constants.altBg.darken(0.05)}
                css={{ zIndex: 2 }}
              />
              {/* <HalfSection css={{ position: 'absolute', bottom: 100 }}>
                <Title italic size={2.5} margin={[0, '10%', 10, 0]}>
                  Use cases
                </Title>
                <P2 size={1.7} alpha={0.75}>
                  Whether personally or as part of a team, Orbit helps make
                  knowledge work for you.
                </P2>
                <P size={1.2} alpha={0.9} fontWeight={500}>
                  <a onClick={scrollTo('#remote-teams')}>Remote teams</a>{' '}
                  &nbsp;&nbsp;&middot;&nbsp;&nbsp;
                  <a onClick={scrollTo('#customer-success')}>
                    Customer Success
                  </a>
                  &nbsp;&nbsp;&middot;&nbsp;&nbsp;
                  <a onClick={scrollTo('#reduce-interrupts')}>Focus</a>
                </P>
              </HalfSection>
              <HalfSection /> */}
            </SectionContent>
          </Section>
        )}
      </Media>
    )
  }
}

@view
class SectionUseCaseRemoteTeams extends React.Component {
  render() {
    return (
      <Media query={Constants.screen.large}>
        {isLarge => (
          <Section id="use-cases" inverse>
            <SectionContent
              id="remote-teams"
              fullscreen={isLarge}
              padded
              css={{ zIndex: 3 }}
            >
              <Glow
                style={{
                  background: Constants.altBg.lighten(0.015),
                  transform: { x: '-30%', y: '-15%' },
                }}
              />
              <Slant
                inverseSlant
                slantGradient={[
                  Constants.altBg.darken(0.05),
                  Constants.useCasesSlantBg1,
                ]}
                css={{ zIndex: 2 }}
              />
              <LeftSide>
                <SubTitle size={5} italic>
                  Remote<br />
                  teams
                </SubTitle>
                <div if={isLarge} css={{ height: '26%' }} />
                <section
                  css={{
                    textAlign: 'left',
                    display: 'block',
                    margin: isLarge ? [-40, 0, 0, '10%'] : 0,
                  }}
                >
                  <P alpha={0.6} size={2} margin={[0, 0, 10]}>
                    Beautiful unified profiles
                  </P>
                  <P2 size={1.6}>
                    Combined information from across the cloud in one place with
                    helpful information.
                  </P2>
                  <P2 size={1.6}>
                    See where people talk in Slack, what topics they care about,
                    and relevant recently edited files, tickets, and more.
                  </P2>
                  <br />
                </section>
                <Callout
                  css={
                    isLarge && {
                      width: '72%',
                      marginLeft: '35%',
                      textAlign: 'left',
                    }
                  }
                >
                  <P2 size={2} margin={0}>
                    Give your remote team a sense of unity and a place to
                    explore your company.
                  </P2>
                </Callout>
              </LeftSide>
              <RightSide inverse css={{ bottom: 0 }}>
                <div $$flex css={{ marginTop: isLarge ? '21%' : 0 }} />
                <P2 if={false} size={1.8} css={{ margin: [5, 0, 10, 0] }}>
                  The smart way to sync
                </P2>
                <P
                  alpha={0.6}
                  size={2}
                  css={{ margin: [0, isLarge ? '12%' : 0, 10, 0] }}
                >
                  News is your team home
                </P>
                <P size={1.6} css={{ marginRight: isLarge ? '15%' : 0 }}>
                  It starts by learning company vocabulary. Then it learns what
                  you care about. The intersection of what you care about and
                  haven't seen, relative to your custom company's unique vocab
                  is shown.
                </P>
                <section
                  if={isLarge}
                  css={{
                    position: 'absolute',
                    top: '38%',
                    left: 50,
                    height: '35%',
                    width: 450,
                    overflow: 'hidden',
                  }}
                >
                  <FadedArea
                    fadeBackground={Constants.altBg}
                    fadeDown
                    fadeRight
                  >
                    <img
                      src={profileImg}
                      css={{
                        position: 'absolute',
                        width: 1199,
                        height: 'auto',
                        transformOrigin: 'top left',
                        transform: {
                          scale: 0.39,
                          x: 0,
                          y: 130,
                        },
                      }}
                    />
                  </FadedArea>
                </section>
              </RightSide>
            </SectionContent>
          </Section>
        )}
      </Media>
    )
  }
}

@view
class SectionUseCaseCustomerSuccess extends React.Component {
  render() {
    return (
      <Media query={Constants.screen.large}>
        {isLarge => (
          <Section id="customer-success" css={{ background: Constants.altBg }}>
            <SectionContent fullscreen={isLarge} padded>
              <Glow
                style={{
                  background: Constants.altBg.lighten(0.025),
                  transform: { x: '40%', y: '-50%' },
                }}
              />
              <Slant
                slantGradient={[
                  Constants.useCasesSlantBg1,
                  Constants.useCasesSlantBg2,
                ]}
              />
              <chat>
                <ChatIcon />
              </chat>
              <LeftSide inverse>
                <div if={isLarge} css={{ height: '48%' }} />

                <section
                  css={{
                    textAlign: 'left',
                    display: 'block',
                    margin: isLarge ? [0, 0, 0, '12%'] : 0,
                  }}
                >
                  <P
                    if={isLarge}
                    alpha={0.6}
                    size={2}
                    css={{ margin: [0, 0, 10, 0] }}
                  >
                    Live help for live support
                  </P>
                  <P2 size={1.6} css={{ margin: isLarge ? [0, 0, 35, 0] : 0 }}>
                    Orbit's contextual answers work with your support software
                    as your team chats. In realtime it searches across your
                    cloud and shows exact sections with answers.
                  </P2>
                </section>
                <Callout
                  if={isLarge}
                  css={{
                    width: '80%',
                    marginLeft: '25%',
                    textAlign: 'left',
                  }}
                >
                  <P2 size={2} margin={0}>
                    Answers on hand for your entire success team, powered by all
                    your knowledgebase.
                  </P2>
                </Callout>
              </LeftSide>
              <RightSide css={{ top: 0 }}>
                <div if={isLarge} $$flex css={{ marginTop: '5%' }} />
                <SubTitle size={5} italic>
                  Customer<br />Success
                </SubTitle>
                <div if={isLarge} $$flex css={{ marginTop: '10%' }} />
                <P
                  if={isLarge}
                  alpha={0.6}
                  size={2}
                  css={{ margin: [0, '15%', 10, 0] }}
                >
                  Reduce onboarding time
                </P>
                <P2 size={1.6} css={isLarge && { marginRight: '15%' }}>
                  Sales chat requires intimate knowledge of your product. Orbit
                  sits side by side with your success team as they chat on
                  Intercom or ZenDesk providing realtime answers from your
                  knowledgebase.
                </P2>
                <Callout
                  if={isLarge}
                  css={{ margin: [45, '10%', 40, 0], left: -30 }}
                >
                  <P2 size={2} margin={0}>
                    Organizational knowledge is now always at hand and usable
                    during outbound chats.
                  </P2>
                </Callout>
              </RightSide>
            </SectionContent>
          </Section>
        )}
      </Media>
    )
  }

  static style = {
    chat: {
      opacity: 0.1,
      filter: 'hue-rotate(40deg) grayscale(100%)',
      transform: { scale: 3 },
      position: 'absolute',
      zIndex: 0,
      left: '27%',
      top: '20%',
    },
  }
}

@view
class SectionUseCaseReduceInterrupts extends React.Component {
  render() {
    return (
      <Media query={Constants.screen.large}>
        {isLarge => (
          <Section inverse css={{ background: Constants.altBg }}>
            <SectionContent
              id="reduce-interrupts"
              fullscreen={isLarge}
              padded
              css={{ zIndex: 3 }}
            >
              <Glow
                style={{
                  background: Constants.altBg.lighten(0.025),
                  transform: { x: '-20%', y: '-25%' },
                }}
              />
              <Slant
                inverseSlant
                slantGradient={[Constants.useCasesSlantBg2, Constants.altBg]}
                css={{ zIndex: 2 }}
              />
              <LeftSide>
                <SubTitle size={5} italic>
                  Workplace<br />
                  interruptions
                </SubTitle>
                <Notification
                  if={isLarge}
                  title="Uber Receipts"
                  body="Your Thursday morning trip with Uber"
                  css={{
                    marginLeft: 'auto',
                    marginTop: 60,
                    marginBottom: -40,
                  }}
                />
                <div if={isLarge} css={{ height: '26%' }} />
                <section
                  css={{
                    textAlign: 'left',
                    display: 'block',
                    margin: isLarge ? [-70, 0, 0, '12%'] : 0,
                  }}
                >
                  <P
                    if={isLarge}
                    alpha={0.6}
                    size={2}
                    css={{ margin: [0, '25%', 10, 0] }}
                  >
                    Stop losing links and files
                  </P>
                  <P2 size={1.6}>
                    Search that works means a lot less time hunting around for
                    links. Combine with smart profiles that show recent
                    collaborations and pings just to find things go down.
                  </P2>
                </section>
                <Callout
                  if={isLarge}
                  css={
                    isLarge && {
                      width: '72%',
                      marginLeft: '35%',
                      marginTop: 35,
                      textAlign: 'left',
                    }
                  }
                >
                  <P2 size={2} margin={0}>
                    The Orbit search model uses state of the art NLP that learns
                    your company corpus.
                  </P2>
                </Callout>
              </LeftSide>
              <RightSide inverse css={{ bottom: 0 }}>
                <div $$flex css={{ marginTop: isLarge ? '20%' : 0 }} />
                <P
                  if={isLarge}
                  alpha={0.6}
                  size={2}
                  css={{ margin: [0, '25%', 10, 0] }}
                >
                  Enabling deep work
                </P>
                <P2 size={1.6} css={{ marginRight: isLarge ? '20%' : 0 }}>
                  Use the power of Do Not Disturb in Slack without losing
                  synchronicity. Home lets you snooze notifications but still
                  pull, exactly when you're ready, to see everything new.
                </P2>
                <Callout css={{ margin: [35, '20%', 0, 0], left: -45 }}>
                  <P2 size={2} margin={0}>
                    Pull, instead of being pushed by notifications.
                  </P2>
                </Callout>
              </RightSide>
            </SectionContent>
          </Section>
        )}
      </Media>
    )
  }
}

@view
export class UseCasesPage extends React.Component {
  render() {
    return (
      <>
        <UI.Theme theme={Constants.peachTheme}>
          <Header />
          <UseCasesIntro />
          <surround css={{ position: 'relative' }}>
            <SectionUseCaseRemoteTeams />
            <SectionUseCaseCustomerSuccess />
            <SectionUseCaseReduceInterrupts />
          </surround>
        </UI.Theme>
        <Footer />
      </>
    )
  }
}
