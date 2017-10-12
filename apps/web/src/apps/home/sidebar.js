import * as React from 'react'
import { view, ProvideStore } from '@mcro/black'
import Fade from './views/fade'
import StackNavigator from './views/stackNavigator'
import * as Panes from './panes'
import { getItem } from './panes/helpers'
import PaneView from './panes/pane'

const width = 250

@view.attach('homeStore')
@view.ui
class SidebarContainer {
  render({ sidebarStore, paneProps, children, ...rest }) {
    return (
      <ProvideStore store={sidebarStore} storeProps={rest}>
        {store => {
          this.props.setStore(store)
          return (
            <PaneView
              store={store}
              getItem={getItem(paneProps.getActiveIndex)}
              {...paneProps}
            />
          )
        }}
      </ProvideStore>
    )
  }
}

@view
export default class Sidebar {
  render({ homeStore }) {
    return (
      <sidebar css={{ width }}>
        <StackNavigator stack={homeStore.stack}>
          {({ stackItem, index, currentIndex, navigate }) => {
            // only show last two
            if (index + 1 < currentIndex) {
              return null
            }
            console.log('stackItem', stackItem)
            if (!stackItem.result) {
              return <null>bad result</null>
            }
            const Pane = Panes[stackItem.result.type]
            if (!Pane || !Pane.Sidebar) {
              return <null>not found Pane {stackItem.result.type}</null>
            }

            const paneProps = {
              index,
              stack: homeStore.stack,
              sidebar: true,
              getActiveIndex: () => stackItem.firstIndex,
              onSelect: stackItem.onSelect,
              itemProps: {
                size: 1.14,
                glow: true,
                padding: [10, 12],
                iconAfter: true,
              },
              width,
              groupKey: 'category',
            }

            return (
              <Fade
                key={index}
                width={width}
                index={index}
                currentIndex={currentIndex}
              >
                <SidebarContainer
                  stackItem={stackItem}
                  navigate={navigate}
                  setStore={stackItem.setStore}
                  data={stackItem.result.data}
                  result={stackItem.result}
                  onBack={homeStore.stack.pop}
                  paneProps={paneProps}
                  sidebarStore={Pane.Sidebar}
                />
              </Fade>
            )
          }}
        </StackNavigator>
      </sidebar>
    )
  }
}