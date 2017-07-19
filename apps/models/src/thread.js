// @flow
import { Thing } from './thing'

class Thread extends Thing {
  static props = Thing.props
  static defaultProps = doc => ({
    ...Thing.defaultProps(doc),
    type: 'thread',
    title: Thing.getTitle(doc),
    content: Thing.getContent(doc),
  })

  static defaultFilter = doc => ({ ...doc, type: 'thread' })

  constructor() {
    super()

    Object.assign(this.methods, {
      replies(parentId) {
        return this.collection.find({ draft: false, parentId, type: 'reply' })
      },
    })
  }
}

export default new Thread()
