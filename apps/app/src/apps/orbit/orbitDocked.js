import * as React from 'react'
import { view, react } from '@mcro/black'
import * as UI from '@mcro/ui'
import OrbitHome from './orbitHome'
import OrbitSettings from './orbitSettings'
import OrbitHeader from './orbitHeader'
import OrbitSearchResults from './orbitSearchResults'
import { App } from '@mcro/all'

const SHADOW_PAD = 85
const DOCKED_SHADOW = [0, 0, SHADOW_PAD, [0, 0, 0, 0.2]]

class DockedStore {
  @react({ log: false })
  animationState = [
    () => App.orbitState.docked,
    async (visible, { sleep, setValue }) => {
      // old value first to setup for transition
      setValue({ willAnimate: true, visible: !visible })
      await sleep(32)
      // new value, start transition
      setValue({ willAnimate: true, visible })
      await sleep(App.animationDuration)
      // done animating, reset
      setValue({ willAnimate: false, visible })
    },
  ]
}

@UI.injectTheme
@view.attach('appStore')
@view({
  store: DockedStore,
})
class OrbitDocked {
  render({ store, appStore, theme }) {
    if (!store.animationState) {
      return null
    }
    const { visible, willAnimate } = store.animationState
    const background = theme.base.background
    const borderColor = theme.base.background.darken(0.25).desaturate(0.6)
    const borderShadow = ['inset', 0, 0, 0, 0.5, borderColor]
    return (
      <frame
        $willAnimate={willAnimate}
        $visible={visible}
        css={{ background, boxShadow: [borderShadow, DOCKED_SHADOW] }}
      >
        <OrbitHeader headerBg={background} />
        <orbitInner>
          <UI.Button
            $settingsButton
            icon="gear"
            borderRadius={100}
            size={1}
            sizeIcon={1}
            circular
            borderWidth={0}
            background={theme.base.background}
            iconProps={{
              color: theme.active.background.darken(0.1),
            }}
            onClick={appStore.toggleSettings}
          />
          <main
            css={{
              opacity: appStore.showSettings ? 0 : 1,
              pointerEvents: appStore.showSettings ? 'none' : 'auto',
            }}
          >
            <OrbitHome appStore={appStore} />
            <OrbitSearchResults parentPane="summary" />
          </main>
          <OrbitSettings />
        </orbitInner>
      </frame>
    )
  }

  static style = {
    frame: {
      position: 'absolute',
      top: 0,
      right: 0,
      zIndex: 2,
      flex: 1,
      pointerEvents: 'none',
      width: App.dockedWidth,
      height: '100%',
      opacity: 0,
      transform: {
        x: 10,
      },
    },
    willAnimate: {
      willChange: 'transform, opacity',
      transition: `
        transform ease-in ${App.animationDuration}ms,
        opacity ease-in ${App.animationDuration}ms
      `,
    },
    visible: {
      pointerEvents: 'auto',
      opacity: 1,
      transform: {
        x: 0,
      },
    },
    main: {
      flex: 1,
    },
    orbitInner: {
      position: 'relative',
      flex: 1,
    },
    settingsButton: {
      position: 'absolute',
      top: -15,
      right: 10,
      zIndex: 10000000000,
    },
  }
}

export default props => (
  <UI.Theme name="tan">
    <OrbitDocked {...props} />
  </UI.Theme>
)