import * as React from 'react'
import { view } from '@mcro/black'
import SectionContent from '~/views/sectionContent'
import { Section, SmallTitle, P2, RightSide, Callout, Link } from '~/views'
import { BrandLogo, Join } from '~/components'
import * as Constants from '~/constants'
import Media from 'react-media'
import stars from '~/public/stars.svg'
import * as UI from '@mcro/ui'

@view
export class Footer extends React.Component {
  render() {
    return (
      <UI.Theme name="dark">
        <Media query={Constants.screen.large}>
          {isLarge => (
            <Section>
              <stars
                $$fullscreen
                css={{
                  opacity: 0.5,
                  background: `url(${stars}) top center`,
                }}
              />
              <SectionContent padded>
                <left
                  $$row
                  css={
                    isLarge
                      ? { width: '50%', padding: [0, 20] }
                      : { padding: [0, 0, 50] }
                  }
                >
                  <Join />
                  <section if={false}>
                    <SmallTitle>Our Mission</SmallTitle>
                    <P2 size={1.6}>
                      Orbit runs intimately in your everyday. That means it has
                      to work for you, the individual.
                      <br />
                      <br />
                      Our goal is to build a more intuitive OS. To do that we
                      need trust. Privacy, security, and user experience our
                      first priorities.
                    </P2>
                  </section>
                </left>
                <RightSide noEdge>
                  <div
                    css={isLarge && { flex: 1, flexFlow: 'row', padding: 40 }}
                  >
                    <nav>
                      <Link css={{ color: '#fff' }} $link to="/features">
                        {isLarge ? 'Features' : 'What'}
                      </Link>
                      <Link css={{ color: '#fff' }} $link to="/use-cases">
                        {isLarge ? 'Use Cases' : 'Why'}
                      </Link>
                      <Link css={{ color: '#fff' }} $link to="/about">
                        {isLarge ? 'About Us' : 'Who'}
                      </Link>
                    </nav>
                    <div $$flex />
                    <BrandLogo white />
                  </div>
                </RightSide>
              </SectionContent>
            </Section>
          )}
        </Media>
      </UI.Theme>
    )
  }

  static style = {
    nav: {
      flex: 1,
      height: '100%',
    },
    link: {
      margin: [0, 0, 10],
    },
  }
}
