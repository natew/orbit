import { Document } from '~/app'
import { sortBy, last, flatMap, memoize, find, flatten, random } from 'lodash'
// import merge from 'deep-extend'
import Router from '~/router'

const liToText = ({ nodes }) =>
  nodes
    .map(node => {
      if (node.type !== 'paragraph') return ''

      const text = node.nodes[0].ranges.map(i => i.text).join('')

      return text
    })
    .join(' ')

export default class SidebarStore {
  docs = Document.recent(100)
  activeTask = null
  hideArchived = true
  inProgress = null

  sortMap = {}

  team = [] /*[
    { name: 'nick', task: 'improve perf on doc loading' },
    { name: 'nate', task: 'buy 50 cases of la croix for office' },
    { name: 'steel', task: 'write the fastest bundler in the world' },
  ]*/

  onArchive = task => {
    const doc = this.docs.filter(doc => doc._id === task.doc._id)[0]

    // const { content } = task.doc
    // doc.content.document.nodes = doc.content.document.nodes.map(node => {
    const newNodes = doc.content.document.nodes.map(node => {
      if (node.type !== 'ul_list') return node
      node.nodes = node.nodes.map(li => {
        if (task.text === liToText(li)) {
          li.data.archive = !(li.data.archive || false)
        }
        return li
      })
      return node
    })
    // doc.content = Object.assign({}, doc.content)
    console.log('nick, why is this deep merging??')
    doc.content = merge(doc.content, { document: { nodes: newNodes } })
    doc.save(false)
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    const task = this.tasks[oldIndex]
    const newVal = this.tasks[newIndex].sort + (oldIndex < newIndex ? +1 : -1)
    this.sortMap = Object.assign({}, this.sortMap, { [task.key]: newVal })
  }

  onSetProgress = task => {
    this.inProgress = task
  }

  onSelect = task => {
    this.activeTask = task
  }

  onKeyDown = () => {}

  onHandleUpKey = () => {
    if (this.activeTask === null) {
      this.activeTask = this.tasks[0]
    } else {
      this.activeTask = this.tasks[this.activeIndex - 1]
    }
  }

  onHandleDownKey = () => {
    if (this.activeTask === null) {
      this.activeTask = last(this.tasks)
    } else {
      this.activeTask = this.tasks[this.activeIndex + 1]
    }
  }

  handleShortcut = action => {
    if (action === 'up' || action === 'k') this.onHandleUpKey()
    if (action === 'down' || action === 'j') this.onHandleDownKey()
    if (action === 'enter') {
      this.activeTask && Router.go(this.activeTask.doc.url())
    }
  }

  get activeIndex() {
    return this.tasks.map(i => i.key).indexOf(this.activeTask.key)
  }

  // we're taking the lastEdited for memoization purposes
  tasksForDoc = memoize((key, doc) => {
    // start somewhere and increment from there
    let keys = random(0, 1000000)

    if (!doc.content.document) return []
    const tasks = doc.content.document.nodes
      .filter(node => {
        return node.type === 'ul_list'
      })
      .map(ul => {
        return ul.nodes
          .map(li => {
            const text = liToText(li)
            const key = keys++
            const sort = +new Date(doc.createdAt) // this.sortMap[key] || +new Date(doc.createdAt) + key

            if (text === '') return null

            return {
              text,
              sort,
              archive: li.data.archive || false,
              doc,
              key,
            }
          })
          .filter(val => val !== null)
      })

    return flatten(tasks)
  })

  get tasks() {
    const docKey = doc => `${doc._id}-${+new Date(doc.updatedAt)}`
    const pets = find(this.docs || [], doc => doc.title === 'Pets')
    const allTasks = sortBy(
      flatMap(this.docs || [], doc =>
        this.tasksForDoc(docKey(doc), doc)
      ).filter(t => (this.inProgress ? t.key !== this.inProgress.key : true)),
      'sort'
    )

    return allTasks
  }
}