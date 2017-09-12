// @flow
import global from 'global'
import { Model, str, object } from '@mcro/model'

const VERB_MAP = {
  PushEvent: 'pushed',
  CreateEvent: 'created branch',
}

// keep here so we can use as generic
export const methods = {
  get verb() {
    return VERB_MAP[this.type]
  },
}

export type EventType = typeof methods & {
  author?: string,
  integration: string,
  type: string,
  data?: Object,
  parentId?: string,
  id?: string,
  org?: string,
  createdAt: string,
  updatedAt: string,
  created?: string,
  updated?: string,
}

export class Event extends Model {
  static props = {
    id: str.primary,
    integration: str.indexed,
    type: str.indexed,
    author: str.optional,
    data: object.optional,
    parentId: str.optional,
    org: str.indexed.optional,
    created: str.indexed.optional,
    updated: str.indexed.optional,
    timestamps: true,
  }

  methods = methods

  settings = {
    database: 'events',
    // version: 1,
  }

  // migrations = {
  //   1: async () => {
  //     console.log('run migration')
  //     // const all = await this.getAll()
  //     // if (all) {
  //     //   all.map(_ => _.remove())
  //     // }
  //   },
  // }
}

const EventInstance = new Event()
global.Event = EventInstance

export default EventInstance
