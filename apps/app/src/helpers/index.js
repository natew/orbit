import latinize from 'latinize'
import * as React from 'react'

export hoverSettler from './hoverSettler'
export logClass from './logClass'

export const trimSingleLine = str => str.trim().replace(/\s{2,}/g, ' ')

export const sleep = ms => new Promise(res => setTimeout(res, ms))

export const contextToResult = state => {
  const pretitle = state.selection || state.title
  return {
    id: state.id,
    title: trimSingleLine(
      pretitle ? `${pretitle} | ${state.name}` : state.name,
    ),
    subtitle: `in ${state.name.replace('Google ', '')} · ${state.url}`,
    type: 'context',
    image: state.favicon,
    peek: false,
  }
}

// because honestly, its easy to forget when writing jsx
// maybe im missing something in flow
window.React = React

export const Component = React.Component

class Cache {
  all = new Set()
  add = item => this.all.add(item)
  remove = item => this.all.delete(item)
}
export const viewCache = new Cache()

import { HotKeys as OGHotKeys } from 'react-hotkeys'

// ensures it doesnt interrupt flexing

export const HotKeys = ({ style, ...props }) => (
  <OGHotKeys
    style={{
      flex: 'inherit',
      flexFlow: 'inherit',
      flexGrow: 'inherit',
      ...style,
    }}
    {...props}
  />
)

// alphanumeric and spacse
export const cleanText = s => {
  if (s.toLowerCase) {
    return latinize(s || '')
      .toLowerCase()
      .replace(/[^0-9a-zA-Z\ ]/g, '')
  } else {
    return ''
  }
}

export const debounceIdle = (fn, timeout) => {
  let clearId = null
  return (...args) => {
    if (clearId) cancelIdleCallback(clearId)

    clearId = (requestIdleCallback || setTimeout)(() => fn(...args), {
      timeout,
    })
  }
}
