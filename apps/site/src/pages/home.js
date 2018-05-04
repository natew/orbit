import * as React from 'react'
import { view } from '@mcro/black'
import Logo from '~/views/logo'
import * as UI from '@mcro/ui'

const P = props => <UI.Text selectable {...props} />
const P2 = props => <P size={2} alpha={0.8} margin={[0, 0, 20]} {...props} />
const Ul = view('span', {
  display: 'inline-block',
  borderBottom: [6, 'rgb(136, 231, 234)'],
})
const Section = view(
  'section',
  {
    height: window.innerHeight,
    padding: [60, 40],
  },
  {
    dark: { background: '#050505' },
  },
)

@view
class Header {
  render() {
    return (
      <Section>
        <top>
          <brandMark>
            <Logo size={0.5} />
            <br />
            <P>The unifying force for your team</P>
          </brandMark>
        </top>
        <div $$flex />
        <main>
          <explain>
            <P size={3} fontWeight={800}>
              Fix <Ul>notification noise</Ul> and <Ul>communication silos</Ul>{' '}
              in one fell swoop.
            </P>
            <br />
            <P size={1.7} alpha={0.5}>
              Give the gift of focus to your team with Orbit
            </P>
          </explain>
          <show />
        </main>
      </Section>
    )
  }

  static style = {
    header: {
      padding: 25,
    },
    top: {
      flexFlow: 'row',
    },
    brandMark: {
      alignSelf: 'flex-end',
      alignItems: 'center',
      textAlign: 'center',
      marginRight: 20,
    },
    main: {
      // padding: [40, 0],
    },
    title: {
      fontSize: 40,
    },
  }
}

@view
class Section2 {
  render() {
    return (
      <UI.Theme name="dark">
        <Section dark>
          <main>
            <P size={3} fontWeight={800}>
              A daily heads up<br />that actually works.
            </P>
            <br />
            <br />
            <P2>Here's the deal..</P2>
            <P2>
              Slack is pretty great. But is has a <Ul>noise</Ul> problem.
            </P2>
            <div $$flex />
            <P2>
              Orbit combines amazing UX<br />
              & state of the art ML<br />
              to give you <Ul>peace of mind</Ul>.
            </P2>
          </main>
        </Section>
      </UI.Theme>
    )
  }

  static style = {
    main: {
      width: 400,
      flex: 1,
    },
  }
}

@view
class Section3 {
  render() {
    return (
      <UI.Theme name="light">
        <Section>
          <main>
            <P size={3} fontWeight={800}>
              Turn off the notifications<br />
              and don't miss a thing
            </P>
            <br />
            <br />
            <P2>
              Orbit is your private, on-device work assistant. It knows what you
              have been doing recently, and makes sure you don't miss out on
              anything else happening across your company.
            </P2>
          </main>
        </Section>
      </UI.Theme>
    )
  }

  static style = {
    main: {
      width: 400,
      flex: 1,
    },
  }
}

@view
class Section4 {
  render() {
    return (
      <UI.Theme name="dark">
        <Section dark>
          <main>
            <P size={3} fontWeight={800}>
              Dramatically improved org chart in 3 minutes
            </P>
            <br />
            <br />
            <P2>
              Inspired by modern tech companies' intranets[1], we set out to
              make yours easy, fun, and far more powerful.
            </P2>
            <br />
            <br />
            <P2>
              Silicon Valley has finally delivered <Ul>a new intranet</Ul>.
            </P2>
          </main>
        </Section>
      </UI.Theme>
    )
  }

  static style = {
    main: {
      width: 400,
      flex: 1,
    },
  }
}

@view
export default class HomePage extends React.Component {
  render() {
    return (
      <home>
        <Header />
        <Section2 />
        <Section3 />
        <Section4 />
        <Header />
      </home>
    )
  }
}
