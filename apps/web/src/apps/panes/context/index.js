import React from 'react'
import { view } from '@mcro/black'
import * as UI from '@mcro/ui'
import PaneView from '~/apps/panes/pane'
import Context from '~/context'
import { take, flatten } from 'lodash'
import { OS } from '~/helpers'

const sleep = n => new Promise(resolve => setTimeout(resolve, n))
const hashStr = s => {
  let hash = 0,
    i,
    chr
  if (s.length === 0) return hash
  for (i = 0; i < s.length; i++) {
    chr = s.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

@view({
  store: class ContextStore {
    url = null
    results = []

    getData = async () => {
      const json = await (await fetch('/stanford.json')).json()
      const questions = []
      const corpus = flatten(
        json.data.slice(0, 100).map(article => {
          return take(article.paragraphs, 5).map(para => {
            const hash = hashStr(para.context)
            para.qas.forEach(({ question }) =>
              questions.push({ question, hash })
            )
            return { title: para.context, hash }
          })
        })
      )
      console.log('corpus is', corpus)

      this.context = new Context(corpus)
      this.corpus = corpus
    }

    async willMount() {
      await this.getData()
      window.contextPane = this
      OS.on('set-context', (event, url) => {
        console.log('got url', url)
        this.url = url
      })
      this.getUrl()
    }

    runContext = text => {
      this.results = this.context.closestItems(text).map(({ item }) => {
        return item.title
      })
    }

    getUrl = () => {
      OS.send('get-context')
      // setTimeout(this.getUrl, 500)
    }
  },
})
export default class ContextView {
  render({ store }) {
    return (
      <div
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
        }}
        css={{ padding: 30 }}
      >
        <UI.Theme name="dark">
          <button
            onClick={() => {
              console.log('getting context')
              OS.send('get-context')
            }}
          >
            get
          </button>
          <UI.Text>url is {store.url}</UI.Text>
          {store.results.map(text => (
            <UI.Text css={{ width: '100%' }}>{text}</UI.Text>
          ))}
          <PaneView
            stackItems={{
              results: { title: 'hello' },
            }}
          />
        </UI.Theme>
      </div>
    )
  }

  static style = {}
}