// @flow
import Server from './server'
import Database, { Models } from '@mcro/models'
import PouchAdapterMemory from 'pouchdb-adapter-memory'
import hostile_ from 'hostile'
import * as Constants from '~/constants'
import { promisifyAll } from 'sb-promisify'
import sudoPrompt_ from 'sudo-prompt'

const hostile = promisifyAll(hostile_)
const sudoPrompt = promisifyAll(sudoPrompt_)

export default class API {
  server: Server

  constructor() {
    this.database = new Database(
      {
        name: 'username',
        password: 'password',
        adapter: PouchAdapterMemory,
        adapterName: 'memory',
        plugins: [
          PouchAdapterMemory,
          {
            hooks: {
              preCreatePouchDb(options) {
                options.settings = {
                  ...options.settings,
                  prefix: '/tmp/my-temp-pouch/',
                }
              },
            },
          },
        ],
      },
      Models
    )
    this.pouch = this.database.pouch
    this.server = new Server({ pouch: this.pouch })
  }

  async start() {
    this.setupHosts()
    const port = this.server.start()
    await this.database.start({
      modelOptions: {
        debug: true,
      },
    })
    console.log('API on port', port)
  }

  dispose() {
    this.server.dispose()
  }

  async setupHosts() {
    const lines = await hostile.get(true)
    const exists = lines.map(line => line[1]).indexOf(Constants.HOST) > -1
    if (!exists) {
      await sudoPrompt.exec(`npx hostile set 127.0.0.1 ${Constants.HOST}`, {
        name: 'Orbit',
      })
    }
  }
}
