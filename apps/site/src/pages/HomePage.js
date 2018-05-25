import * as React from 'react'
import { view } from '@mcro/black'
import * as UI from '@mcro/ui'
import { Header, Join } from '~/components'
import SectionContent from '~/views/sectionContent'
import {
  Section,
  Slant,
  Title,
  P,
  P2,
  LeftSide,
  RightSide,
  AppleLogo,
} from '~/views'
// import girlImg from '~/public/video-girl.jpg'
import { HomePlay } from './home/HomePlay'
import * as Constants from '~/constants'
import Media from 'react-media'
import Router from '~/router'
import { scrollTo } from '~/helpers'
import { Keyframes, Spring, animated } from 'react-spring'
import topo from '~/public/topo2.svg'
import { throttle } from 'lodash'
import bg from '~/public/cav.jpg'

const borderColor = '#fff' || Constants.colorMain.darken(0.15)
// const blackBg = UI.color('#111')
// const blackTheme = {
//   background: UI.color(Constants.leftBg),
//   color: '#f2f2f2',
//   subTitleColor: '#eee',
//   titleColor: blackBg.darken(0.75).desaturate(0.3),
// }
const bottomRightBackground = '#121212'
const firstSlant = {
  slantSize: 6,
  amount: 40,
  slantBackground: borderColor,
  css: { zIndex: 0 },
}
const secondSlant = {
  slantSize: 10,
  amount: 25,
  slantBackground: [200, 200, 200, 0.15],
  css: { zIndex: 0 },
}
const thirdSlant = {
  slantBackground: [150, 150, 150, 0.2],
  slantSize: 4,
  amount: 15,
}

class HomeStore {
  stars = null

  willMount() {
    this.on(
      window,
      'scroll',
      throttle(() => {
        const max = window.innerHeight * 3
        // 0 - 1 of how far down we are
        const pctDown =
          (max - (max - document.scrollingElement.scrollTop)) / max
        const offset = pctDown * 15
        // this.stars.stopAnimation()
        this.stars(Spring, {
          to: { y: -offset },
        })
      }, 100),
    )

    setTimeout(() => {
      this.stars(Spring, {
        to: { y: 0 },
      })
    })
  }
}

@view({
  store: HomeStore,
})
class HomeHeader extends React.Component {
  render({ isMedium, store }) {
    return (
      <Media query={Constants.screen.large}>
        {isLarge => {
          return (
            <Section css={{ background: 'transparent' }}>
              <borderBottom
                if={false}
                css={{
                  position: 'absolute',
                  bottom: 0,
                  left: '48.035%',
                  right: 0,
                  height: 6,
                  background: borderColor,
                  zIndex: 1000,
                }}
              />
              <paintingOverflow css={{ overflow: 'hidden' }} $$fullscreen>
                <paintingWrap $$fullscreen>
                  <Keyframes native script={ref => (store.stars = ref)}>
                    {({ y }) => (
                      <animated.div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          transform: y.interpolate(
                            y => `translate3d(0,${y}%,0)`,
                          ),
                        }}
                      >
                        <painting $$fullscreen />
                      </animated.div>
                    )}
                  </Keyframes>
                </paintingWrap>
              </paintingOverflow>
              <SectionContent padded fullscreen>
                <UI.Theme name="dark">
                  <inner
                    css={{
                      position: 'absolute',
                      bottom: '-10%',
                      left: '48.7%',
                      right: '-100%',
                      padding: [180, 0, 120, 55],
                      background: `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.6) 30%, ${bottomRightBackground} 95%)`,
                      // border: [4, '#000'],
                      transform: {
                        rotate: '4.25deg',
                      },
                    }}
                  >
                    <innerInner
                      css={{
                        width: 420,
                        transform: {
                          rotate: '-4.25deg',
                        },
                      }}
                    >
                      <Title
                        italic
                        size={isMedium ? 6 : 7.5}
                        margin={[0, 0, 20, 0]}
                        alpha={1}
                      >
                        Team OS
                      </Title>
                      <P
                        size={1.6}
                        sizeLineHeight={1.15}
                        fontWeight={300}
                        alpha={0.9}
                      >
                        Give your Mac a brain that sorts the cloud. Orbit is a
                        productive new interface that puts team knowledge at
                        your fingertips.
                      </P>
                      <actions
                        $$row
                        css={{
                          margin: isLarge ? [25, 'auto', 0, 0] : [20, 0, 0, 0],
                          alignItems: 'center',
                        }}
                      >
                        <UI.Button
                          background="transparent"
                          borderColor="#444"
                          color="#fff"
                          size={1.1}
                          onClick={scrollTo('#join')}
                          $smallInstallBtn={!isLarge}
                          fontWeight={700}
                          css={{
                            margin: [0, 10, 0, -10],
                            cursor: 'pointer',
                            lineHeight: '1.1rem',
                          }}
                        >
                          Coming soon for{' '}
                          <AppleLogo
                            width={20}
                            height={20}
                            css={{
                              fill: '#ccc',
                              display: 'inline-block',
                              margin: [-2, 0, 0, 4],
                              // opacity: 0.32,
                            }}
                          />
                        </UI.Button>
                        <UI.Button
                          if={false}
                          chromeless
                          alpha={0.4}
                          onClick={Router.link('/features')}
                          margin={[0, 0, 0, 10]}
                          css={{
                            cursor: 'pointer',
                          }}
                        >
                          Learn more
                        </UI.Button>
                      </actions>
                    </innerInner>
                  </inner>
                </UI.Theme>
                <Slant {...firstSlant} />
                <Slant inverseSlant if={false} {...secondSlant} />
                <Slant if={false} {...thirdSlant} />
                <leftSide
                  css={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '50%',
                  }}
                >
                  <Media
                    query={Constants.screen.large}
                    render={() => <HomePlay />}
                  />
                </leftSide>
                <rightSide />
              </SectionContent>
            </Section>
          )
        }}
      </Media>
    )
  }

  static style = {
    paintingWrap: {
      left: '50.2%',
      right: '-10%',
      top: '-15%',
      bottom: '-15%',
      overflow: 'hidden',
      transform: {
        rotate: '4.3deg',
      },
    },
    painting: {
      // opacity: 0.2,
      background: `url(${bg}) no-repeat top left`,
      backgroundSize: 'cover',
      bottom: '-10%',
      transform: {
        rotate: '-4.3deg',
        x: '-5%',
        y: '-10%',
      },
    },
    spacer: {
      pointerEvents: 'none',
    },
    mainSection: {
      position: 'relative',
      zIndex: 10,
      // background: '#fff',
    },
    smallCallout: {
      padding: [0, 0, 40, 0],
    },
    largeCallout: {
      position: 'absolute',
      top: 0,
      left: '55%',
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      // border: [1, [0, 0, 0, 0.04]],
      // padding: [60, 40],
      // margin: [-60, -40],
    },
    borderLine: {
      margin: [40, 40, 20, 0],
      width: '65%',
      height: 1,
      background: [0, 0, 0, 0.05],
    },
    smallInstallBtn: {
      // transform: {
      //   scale: 1.2,
      // },
    },
    small: {
      fontSize: 14,
      fontWeight: 300,
    },
    rightSide: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: '50%',
      pointerEvents: 'none',
    },
  }
}

@view
class HomeFooter extends React.Component {
  render() {
    return (
      <UI.Theme theme="light">
        <Media query={Constants.screen.large}>
          {isLarge => (
            <Section
              css={{
                background: 'transparent',
              }}
              inverse
            >
              <rightBackground
                $$fullscreen
                css={{
                  left: '55%',
                  background: bottomRightBackground,
                }}
              />
              <SectionContent padded fullscreen>
                <Slant
                  inverseSlant
                  {...firstSlant}
                  rightBackground={bottomRightBackground}
                />
                <Slant if={false} {...secondSlant} />
                <Slant inverseSlant if={false} {...thirdSlant} />
                <LeftSide css={{ textAlign: 'left' }}>
                  <div css={{ height: '22%' }} />
                  <below css={{ margin: [15, '15%', 0, 0] }}>
                    <UI.PassProps
                      size={1.3}
                      sizeLineHeight={1.2}
                      alpha={0.85}
                      style={{
                        background: '#fff',
                        padding: 5,
                        margin: -5,
                        marginBottom: 15,
                      }}
                    >
                      <P2 size={2.8} alpha={1} fontWeight={400}>
                        A home for your day
                      </P2>
                      <P2>
                        You and your team have a lot of knowledge. Much of it
                        lives in silos spread around the cloud. Orbit unifies
                        that knowledge on your desktop and gives it a brain.
                      </P2>
                      <P2>
                        With a smart interface and new technology that enables
                        it to understand what you're looking at and care about,
                        Orbit aims to reinvent desktop computing.
                      </P2>
                      <P2>
                        That's why Orbit is{' '}
                        <span css={{ fontWeight: 500, fontStyle: 'italic' }}>
                          completely private and on-device
                        </span>. It's a new way to operate, so it has to work
                        for you.
                      </P2>
                      <space css={{ height: 25 }} />
                      <P2 color={Constants.colorMain} fontWeight={500}>
                        Sign up for early access to learn more as we build it.
                      </P2>
                    </UI.PassProps>
                  </below>
                </LeftSide>
                <RightSide noEdge $$centered>
                  <UI.Theme name="dark">
                    <Join
                      css={{
                        transform: {
                          scale: 1.2,
                          rotate: '1.5deg',
                          y: -20,
                          x: -0,
                        },
                      }}
                    />
                  </UI.Theme>
                </RightSide>
              </SectionContent>
            </Section>
          )}
        </Media>
      </UI.Theme>
    )
  }
}

export const HomePage = () => (
  <Media query={Constants.screen.medium}>
    {isMedium => (
      <>
        <leftBackground
          $$fullscreen
          css={{
            right: '45%',
            zIndex: 0,
            opacity: 0.035,
            background: `url(${topo})`,
          }}
        />
        <Header
          linkStyle={{
            color: Constants.colorMain,
            background: '#fff',
          }}
          linkStyleHover={{
            background: Constants.colorMain,
            color: '#fff',
          }}
        />
        <HomeHeader isMedium={isMedium} />
        <HomeFooter isMedium={isMedium} />
      </>
    )}
  </Media>
)
