// @flow
import global from 'global'
import { Model, str, object } from '@mcro/model'

declare class CurrentUser {}

// keep here so we can use as generic
export const methods = {}

export type ThingType = typeof methods & {
  title: string,
  body?: string,
  data?: Object,
  integration: 'github',
  type: 'issue',
  parentId?: string,
  id?: string,
  createdAt: string,
  updatedAt: string,
  created?: string,
  updated?: string,
  date: string,
  orgName?: string,
}

export class Thing extends Model {
  static props = {
    id: str.primary,
    title: str,
    integration: str,
    type: str,
    body: str.optional,
    data: object.optional,
    parentId: str.optional,
    created: str.optional,
    updated: str.optional,
    orgName: str.optional,
    timestamps: true,
  }

  methods = methods

  settings = {
    database: 'things',
    index: ['title', 'body', 'created', 'createdAt', 'updated', 'updatedAt'],
    // version: 1,
  }

  // migrations = {
  //   1: async () => {
  //     console.log('migrate thing')
  //     // const all = await this.getAll()
  //     // if (all) {
  //     //   all.map(_ => _.remove())
  //     // }
  //   },
  // }

  search = async (text: string) => {
    if (!text) {
      return null
    }
    const { rows } = await this.pouch.search({
      query: text,
      fields: ['body', 'title'],
      include_docs: false,
      highlighting: false,
    })
    const ids = rows.map(row => row.id)
    return await this.collection.find({ _id: { $in: ids } }).exec()
  }

  setCurrentUser = (currentUser: CurrentUser) => {
    this.currentUser = currentUser
  }
}

const ThingInstance = new Thing()
global.Thing = ThingInstance

export default ThingInstance
