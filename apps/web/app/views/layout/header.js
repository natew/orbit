import React from 'react'
import { view } from '@jot/black'
import Router from '~/router'
import { Segment, SlotFill, Button } from '~/ui'
import { HEADER_HEIGHT, IS_ELECTRON } from '~/constants'
import * as Commander from '~/views/commander'

@view
export default class Header {
  render({ layoutStore }) {
    // use sidebar.active so it binds to variable and rerenders
    layoutStore.sidebar.active

    return (
      <header
        $$draggable
        $hovered={layoutStore.headerHovered}
        onMouseEnter={() => (layoutStore.headerHovered = true)}
        onMouseLeave={() => (layoutStore.headerHovered = false)}
      >
        <bar>
          <Segment
            $$margin={[0, 10, 0, 0]}
            itemProps={{ iconSize: 12, padding: [0, 6] }}
            $$flex="none"
          >
            <Button
              if={IS_ELECTRON}
              icon="minimal-left"
              chromeless
              disabled={Router.atBack}
              onClick={() => Router.back()}
            />
            <Button
              if={IS_ELECTRON}
              chromeless
              disabled={Router.atFront}
              icon="minimal-right"
              onClick={() => Router.forward()}
            />
            <Button icon="home" chromeless onClick={() => Router.go('/')} />
          </Segment>
          <Commander.Bar
            onOpen={() => (layoutStore.commanderOpen = true)}
            onClose={() => (layoutStore.commanderOpen = false)}
          />
        </bar>
        <rest $$row>
          <SlotFill.Slot name="documentActions">
            {items =>
              <actions>
                {items}
              </actions>}
          </SlotFill.Slot>
          <SlotFill.Slot name="actions">
            {items =>
              <actions>
                {items}
                <Button
                  chromeless
                  spaced
                  icon={
                    layoutStore.sidebar.active
                      ? 'arrow-min-right'
                      : 'arrow-min-left'
                  }
                  onClick={layoutStore.sidebar.toggle}
                  $$marginRight={-6}
                  color={[0, 0, 0, 0.5]}
                />
              </actions>}
          </SlotFill.Slot>
        </rest>
      </header>
    )
  }

  static style = {
    header: {
      background: [255, 255, 255, 1],
      zIndex: 500,
      padding: [0, 10, 0, IS_ELECTRON ? 80 : 10],
      flexFlow: 'row',
      height: HEADER_HEIGHT,
      transition: 'all ease-out 300ms',
      transitionDelay: '400ms',
    },
    bar: {
      flex: 1,
      flexFlow: 'row',
      alignItems: 'center',
    },
    crumbs: {
      height: 0,
    },
    hovered: {
      opacity: 1,
      transition: 'all ease-in 100ms',
      transitionDelay: '0',
    },
    rest: {
      justifyContent: 'center',
      marginLeft: 10,
    },
    actions: {
      flexFlow: 'row',
      alignItems: 'center',
    },
  }
}
