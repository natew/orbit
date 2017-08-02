// @flow
import React from 'react'
import { view } from '@mcro/black'
import * as UI from '@mcro/ui'
import fuzzy from 'fuzzy'

const icons = {
  gmail: (
    <svg x="0px" y="0px" viewBox="0 0 512 512">
      <g>
        <polygon
          style={{ fill: '#0093EB' }}
          points="100.571,383.086 100.571,341.943 170.057,382.171 256,301.714 256,484.571 	"
        />
        <polygon
          style={{ fill: '#0093EB' }}
          points="17.371,274.286 107.886,192 256,283.429 170.057,363.886 	"
        />
        <polygon
          style={{ fill: '#0093EB' }}
          points="107.886,192 0,109.714 155.429,27.429 265.143,100.571 	"
        />
        <polygon
          style={{ fill: '#0093EB' }}
          points="411.429,384 256,484.571 256,301.714 344.686,378.514 411.429,336.457 	"
        />
        <polygon
          style={{ fill: '#0093EB' }}
          points="344.686,360.229 256,283.429 405.029,188.343 494.629,265.143 	"
        />
        <polygon
          style={{ fill: '#0093EB' }}
          points="405.029,188.343 265.143,100.571 374.857,27.429 512,109.714 	"
        />
      </g>
    </svg>
  ),

  drive: (
    <svg viewBox="0 0 139 120.4">
      <radialGradient
        id="a"
        cx="-254.81979"
        cy="705.83588"
        gradientTransform="matrix(2.827 1.6322 -1.6322 2.827 2092.1199 -1494.5786)"
        gradientUnits="userSpaceOnUse"
        r="82.978401"
      >
        <stop offset="0" stopColor="#4387fd" />
        <stop offset=".65" stopColor="#3078f0" />
        <stop offset=".9099" stopColor="#2b72ea" />
        <stop offset="1" stopColor="#286ee6" />
      </radialGradient>
      <radialGradient
        id="b"
        cx="-254.8174"
        cy="705.83691"
        gradientTransform="matrix(2.827 1.6322 -1.6322 2.827 2092.1199 -1494.5786)"
        gradientUnits="userSpaceOnUse"
        r="82.973"
      >
        <stop offset="0" stopColor="#ffd24d" />
        <stop offset="1" stopColor="#f6c338" />
      </radialGradient>
      <path d="m24.2 120.4-24.2-41.9 45.3-78.5 24.2 41.9z" fill="#0da960" />
      <path d="m24.2 120.4 24.2-41.9h90.6l-24.2 41.9z" fill="url(#a)" />
      <path d="m139 78.5h-48.4l-45.3-78.5h48.4z" fill="url(#b)" />
      <path d="m69.5 78.5h-21.1l10.5-18.3-34.7 60.2z" fill="#2d6fdd" />
      <path d="m90.6 78.5h48.4l-58.9-18.3z" fill="#e5b93c" />
      <path d="m58.9 60.2 10.6-18.3-24.2-41.9z" fill="#0c9b57" />
    </svg>
  ),
}

class BarFeedStore {
  get results() {
    return [
      {
        id: 0,
        title: 'Item 1',
        action: 'edited',
        date: '2m ago',
        content: 'Some small amount of editing went into this one.',
        icon: 'gmail',
      },
      {
        id: 1,
        title: 'Item 1',
        action: 'edited',
        date: '2m ago',
        content:
          'This is a much longer edit. Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
        icon: 'drive',
      },
      {
        id: 3,
        title: 'Item 1',
        action: 'uploaded a new document',
        date: '2m ago',
        icon: 'drive',
      },
      {
        id: 2,
        title: 'Item 1',
        action: 'edited',
        date: '2m ago',
        content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
        icon: 'gmail',
      },
    ]
  }
}

@view({
  store: BarFeedStore,
})
export default class BarFeed {
  getLength = () => this.props.store.results.length

  render({ store, onRef, highlightIndex, activeIndex, data }) {
    onRef(this)
    return (
      <feed>
        {store.results.map((result, index) =>
          <item $active={activeIndex === index} key={result.id}>
            <meta>
              <avatar $img={`/images/${data.image}.jpg`} />
              <span $name>
                {parent.title}
              </span>
              <span $action>
                {result.action}
              </span>
              <span $date>
                {result.date}
              </span>
            </meta>
            <body if={result.content}>
              <content>
                {result.content}
              </content>
              <icon>
                <iconBg />
                {icons[result.icon]}
              </icon>
            </body>
          </item>
        )}
      </feed>
    )
  }

  static style = {
    item: {
      padding: [10, 15],
      color: '#fff',
      borderBottom: [1, [0, 0, 0, 0.05]],
    },
    meta: {
      flexFlow: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      fontSize: 13,
      marginBottom: 5,
    },
    name: {
      fontWeight: 500,
    },
    action: {
      opacity: 0.5,
    },
    date: {
      opacity: 0.5,
    },
    body: {
      flexFlow: 'row',
    },
    content: {
      flex: 1,
      padding: [2, 5],
    },
    icon: {
      width: 26,
      height: 26,
      margin: [10, 5, 0],
      position: 'relative',
    },
    iconBg: {
      position: 'absolute',
      top: -2,
      zIndex: -1,
      width: '100%',
      height: '100%',
      transform: {
        scale: 1.2,
      },
      background: '#fff',
      borderRadius: 1000,
      opacity: 0.05,
    },
    span: {
      marginRight: 4,
    },
    avatar: {
      width: 16,
      height: 16,
      borderRadius: 100,
      marginRight: 4,
    },
    img: src => ({
      background: `url(${src})`,
      backgroundSize: 'cover',
    }),
    active: {
      background: [0, 0, 0, 0.1],
    },
  }
}