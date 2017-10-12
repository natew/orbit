// @flow
import * as Helpers from '../helpers'
import type { Setting } from '@mcro/models'
import debug from 'debug'

const log = debug('sync')
const DEFAULT_CHECK_INTERVAL = 1000 * 60 // 1 minute

export default class Syncer {
  // external interface, must set:
  static settings: {
    syncers: Object<string, Object>,
    type: string,
    actions: Object,
  }

  constructor({ user, sync }) {
    this.user = user
    this.sync = sync
  }

  // internal
  syncers = {}
  jobWatcher: ?number

  start() {
    const { settings } = this.constructor
    const { syncers } = settings

    // setup syncers
    if (syncers) {
      this.syncers = {}
      for (const key of Object.keys(syncers)) {
        const Syncer = syncers[key]
        this.syncers[key] = new Syncer(this)

        // helper to make checking syncers easier
        if (!this[key]) {
          this[key] = this.syncers[key]
        }
      }
    }

    // every so often
    this.jobWatcher = setInterval(
      () => this.check(false),
      settings.checkInterval || DEFAULT_CHECK_INTERVAL
    )
    this.check(false)
  }

  async run(action: string) {
    if (!action) {
      throw new Error('Must provide action')
    }
    if (!this.token) {
      throw new Error('No token found for syncer')
    }
    this.ensureSetting()
    log(`Running ${this.type} ${action}`)
    await this.syncers[action].run()
  }

  async runAll() {
    await Promise.all(Object.keys(this.syncers).map(x => this.run(x)))
  }

  get type(): string {
    return this.constructor.settings.type
  }

  get actions(): string {
    return this.constructor.settings.actions
  }

  get setting(): ?Setting {
    return this.user.setting[this.type]
  }

  get token(): ?string {
    return this.user.token(this.type)
  }

  async refreshToken() {
    return await this.user.refreshToken(this.type)
  }

  async check(loud: boolean = true): Array<any> {
    const { type, actions } = this
    log('Syncer.check', this.sync.enabled, actions)
    if (!this.sync.enabled) {
      return
    }
    if (!actions) {
      return
    }
    const syncers = []
    for (const action of Object.keys(actions)) {
      const job = actions[action]
      syncers.push(Helpers.ensureJob(type, action, job, loud))
    }
    return await Promise.all(syncers)
  }

  ensureSetting() {
    if (!this.setting) {
      throw new Error('No setting found for ' + this.type)
    }
  }

  dispose() {
    if (this.jobWatcher) {
      clearInterval(this.jobWatcher)
    }
    if (super.dispose) {
      super.dispose()
    }
  }
}
