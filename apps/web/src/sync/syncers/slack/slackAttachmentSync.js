// @flow
import App, { Thing } from '~/app'
import { createInChunks } from '~/sync/helpers'
import debug from 'debug'
import * as _ from 'lodash'
import * as r2 from '@mcro/r2'

const log = _ => _ || debug('sync')

export default class SlackAttachmentSync {
  constructor({ setting, token, helpers }) {
    this.setting = setting
    this.token = token
    this.helpers = helpers
    // TODO REMOVE THIS IS TESTING PURPOSES ONLY:
    // this.run()
  }

  get service() {
    return App.services.Slack
  }

  get lastSync() {
    return this.setting.values.lastAttachmentSync || {}
  }

  run = async () => {
    if (this.service.activeChannels) {
      for (const channel of Object.keys(this.service.activeChannels)) {
        const oldestSynced = this.lastSync[channel]
        const messages = await this.service.channelHistory({
          channel,
          oldest: oldestSynced,
          count: 2000,
        })
        console.log('got messages', messages)
        const links = _.chain(messages)
          .map(message => message.text.match(/\<([a-z]+:\/\/[^>]+)\>/g))
          .filter(Boolean)
          .flatten()
          // remove the <wrapping-things>
          .map(link =>
            link
              .slice(1, link.length)
              .slice(0, link.length - 2)
              .replace(/\|.*$/g, '')
          )
          .value()

        if (!links.length) {
          log('No links found')
          return
        }

        console.log('disabling until /crawler/exact works')
        return

        try {
          const results = await r2.post('http://localhost:3001/crawler/exact', {
            json: {
              options: {
                entries: links,
              },
            },
          }).json

          if (results && results.length) {
            await createInChunks(results, this.createThings)
          }

          // write last sync
          const oldestSyncedTime = messages[messages.length - 1].ts
          console.log('oldestSyncedTime', oldestSyncedTime)
          await this.setting.mergeUpdate({
            values: {
              lastAttachmentSync: {
                [channel]: oldestSyncedTime,
              },
            },
          })
        } catch (err) {
          log(`Error crawling results ${err.message}\n${err.stack}`)
        }
      }
    }
  }
}