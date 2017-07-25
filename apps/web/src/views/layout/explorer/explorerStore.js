// @flow
import { keycode } from '@mcro/black'
import { Document, User } from '~/app'
import Router from '~/router'
import { uniq, last, includes, dropRightWhile } from 'lodash'
import { Raw } from 'slate'
import App from '~/app'
import { debounce } from 'lodash'

const PATH_SEPARATOR = '/'

export default class ExplorerStore {
  get document() {
    return this.props.rootStore.document
  }

  get crumbs() {
    return this.props.rootStore.crumbs
  }

  editorState = Raw.deserialize(
    {
      nodes: [
        {
          kind: 'block',
          type: 'paragraph',
          nodes: [
            {
              kind: 'text',
              text: '',
            },
          ],
        },
      ],
    },
    { terse: true }
  )

  path = ''
  highlightIndex = -1
  searchResults: Array<Document> = []
  inputNode: ?HTMLInputElement = null
  focused = false
  showResults = false
  showBrowse = false
  focusPaneIndex = 0
  isCreatingNew = false

  start() {
    this.watch(() => {
      if (this.document) {
        this.setPath(this.document)
        this.isCreatingNew = false
      }
    })

    this.watch(async () => {
      if (!this.isTypingPath) {
        // search
        const [searchResults, pathSearchResults] = await Promise.all([
          Document.search(this.value).exec(),
          Document.collection
            .find()
            .where('slug')
            .regex(new RegExp(`^${this.value}`, 'i'))
            .limit(20)
            .exec(),
        ])

        this.searchResults = uniq(
          [...(searchResults || []), ...pathSearchResults],
          x => x.id
        )
      } else {
        // path navigate
        this.searchResults = await this.getChildDocsForPath(
          this.typedPathPrefix
        )
      }
    })

    this.watch(() => {
      if (this.crumbs && Array.isArray(this.crumbs)) {
        this.setValue(this.toPath(this.crumbs.slice(1)))
      }
    })

    this.watch(() => {
      if (Router.path === '/') {
        this.setValue('')
      }
    })
  }

  get firstLine() {
    return this.editorState.document.nodes.first()
  }

  get value() {
    return this.nodesToPath(this.firstLine.nodes.toJS())
  }

  get isSelected() {
    return false
    return this.inputNode.selectionEnd > this.inputNode.selectionStart
  }

  select = (start, end) => {
    this.inputNode.setSelectionRange(start, end)
  }

  actions = {
    toggleSidebar: () => {
      App.layoutStore.sidebar.toggle()
    },
    esc: () => {
      if (App.errors.length) {
        App.clearErrors()
      }
    },
    enter: () => this.onEnter(),
    cmdL: () => {
      this.focus()
      this.selectAll()
    },
    focus: () => this.focus(),
    explorer: () => this.focus(),
    right: () => {
      if (!this.focused || !this.searchResults) return
      this.onRight()
    },
    down: () => {
      if (!this.focused) return
      if (!this.showResults || !this.focused) {
        this.action('focusDown')
        return
      }
      this.moveHighlight(1)
    },
    up: () => {
      if (!this.focused) return
      this.moveHighlight(-1)
    },
    cmdUp: () => {
      console.log('gmcup')
      Router.go(this.crumbs[this.crumbs.length - 2].url())
    },
    togglePane: () => {
      console.log('toggle pane')
      this.focusPaneIndex = this.focusPaneIndex + 1 % this.panes.length
    },
  }

  blur = () => {
    if (!this.inputNode) return
    this.inputNode.blur()
  }

  focus = () => {
    if (!this.inputNode) {
      return
    }
    this.inputNode.focus()
    setTimeout(() => {
      this.editorState = this.editorState
        .transform()
        .collapseToEndOf(this.editorState.document.nodes.last())
        .apply()
    })
  }

  selectAll = () => {
    // this.editorState = this.editorState.transform().
    log('selectall')
  }

  get peek(): Array<Document> {
    if (!this.typedPathSuffix) {
      return this.searchResults
    }
    return this.searchResults.filter(
      doc => doc.slug.indexOf(this.typedPathSuffix) === 0
    )
  }

  get isEnterToCreate() {
    return this.isTypingPath && this.peek && this.peek.length === 0
  }

  get currentPath(): string {
    return this.splitPath(this.crumbs)
  }

  get isTypingPath(): boolean {
    return this.value.indexOf('/') > -1
  }

  get typedPath(): Array<string> {
    return this.splitPath(this.value)
  }

  get typedPathPrefix(): string {
    if (!this.isTypingPath) {
      return this.value
    }
    const all = this.splitPath(this.value)
    // if on root path
    if (all.length === 1) {
      return this.value
    }
    // else, return up to current dir
    return all.slice(0, all.length - 1).join(PATH_SEPARATOR)
  }

  get typedPathSuffix(): ?string {
    const path = this.typedPath
    return path.length > 1 ? path[path.length - 1] : null
  }

  get selectedItem() {
    const inline = this.editorState.focusInline
    if (!inline || inline.type !== 'item') return null
    return inline
  }

  get selectedItemKey() {
    return this.selectedItem && this.selectedItem.key
  }

  get itemNodes() {
    return this.firstLine.nodes.filter(i => i.type === 'item')
  }

  get selectedItemIndex() {
    return this.itemNodes.map(i => i.key).indexOf(this.selectedItemKey)
  }

  get highlightedDocument() {
    if (this.highlightIndex === -1) return null
    return this.peek[this.highlightIndex]
  }

  toPath = (crumbs: Array<Document>): string => {
    return crumbs.map(document => document.slug).join(PATH_SEPARATOR)
  }

  splitPath = (path: string): Array<string> => {
    return path.split(PATH_SEPARATOR)
  }

  onCommitItem = name => {
    const suffix = this.editorState.document.nodes.first().nodes.last()
    if (!name) {
      name = suffix.text
    }

    if (name.trim().length === 0) return

    const value = [
      ...this.value.split(PATH_SEPARATOR).slice(0, -1),
      name,
      '',
    ].join(PATH_SEPARATOR)
    this.setValue(value)

    requestAnimationFrame(() => {
      this.inputNode.focus()
      this.isCreatingNew = true
      this.editorState = this.editorState
        .transform()
        .collapseToEndOf(this.firstLine.nodes.last())
        .apply()
    })
  }

  onChange = state => {
    this.highlightIndex = -1
    this.editorState = state
  }

  setValue = text => {
    if (this.value === text) return
    const paths = text.split(PATH_SEPARATOR)
    const allNodes = this.isCreatingNew ? paths.slice(0, -1) : paths
    const pathNodes = allNodes.map(name => {
      const doc =
        this.crumbs &&
        this.crumbs.find(
          crumb => crumb.title.toLowerCase() === name.toLowerCase()
        )
      return {
        kind: 'inline',
        type: 'item',
        isVoid: true,
        data: { name, doc },
      }
    })
    const suffixNode = {
      kind: 'text',
      text: last(paths),
    }

    const nodes = this.isCreatingNew ? [...pathNodes, suffixNode] : pathNodes

    this.editorState = Raw.deserialize(
      { nodes: [{ kind: 'block', type: 'paragraph', nodes }] },
      { terse: true }
    )
  }

  createDocAtPath = async (path: string): Document => {
    return await this.getDocAtPath(path, true)
  }

  createDocsAtPath = async (path: string): Array<Document> => {
    return await this.getDocsAtPath(path, true)
  }

  getDocAtPath = async (path: string, create = false): ?Document => {
    const pathLength = this.splitPath(path).length
    const docs = await this.getDocsAtPath(path, create)
    return docs[pathLength - 1] || null
  }

  getDocsAtPath = async (path: string, create = false): Array<Document> => {
    const result = []
    let last
    if (path === '/') {
      return User.home
    }
    for (const slug of this.splitPath(path)) {
      const query = { slug }
      if (last) {
        query.parentId = last._id
      }
      let next = await Document.collection.findOne(query).exec()
      if (!next && create) {
        next = await Document.create({
          ...query,
          title: slug,
          parentIds: result.map(doc => doc._id),
        })
      }
      if (!next) {
        return result
      }
      last = next
      result.push(last)
    }
    return result
  }

  getChildDocsForPath = async (path: string): Array<Document> => {
    if (path === '/') {
      return User.home
    }
    const lastDoc = await this.getDocAtPath(path)
    if (!lastDoc) {
      return []
    }
    return await this.getChildDocs(lastDoc)
  }

  getChildDocs = async (document: Document): Array<Document> => {
    return await Document.collection.find({ parentId: document._id }).exec()
  }

  getPathForDocs = (docs: Array<Document>): string =>
    docs.map(doc => doc.title).join(PATH_SEPARATOR)

  onFocus = () => {
    // this.showResults = true
    this.focused = true
  }

  onBlur = () => {
    this.focused = false
    this.active = false
    this.showResults = false
  }

  onActivate = () => {
    this.active = true
    requestAnimationFrame(() => {
      this.focus()
    })
  }

  onEnter = async () => {
    if (!this.focused) {
      return
    }

    if (this.highlightIndex > -1) {
      this.navTo(this.highlightedDocument)
    } else if (this.selectedItem) {
      this.onItemClick(this.selectedItemKey)
    } else {
      const found = await this.createDocAtPath(this.value)
      this.navTo(found)
    }
    this.setTimeout(() => App.editor && App.editor.focus(), 200)
  }

  onItemClick = async key => {
    const nodes = dropRightWhile(
      this.firstLine.nodes.toJS(),
      n => n.key !== key
    )

    const path = this.nodesToPath(nodes)
    this.navTo(await this.getDocAtPath(path, true))
  }

  nodesToPath = nodes => {
    return nodes
      .map(n => {
        if (n.type === 'item') return n.data.name
        return n.characters.map(i => i.text).join('')
      })
      .filter((i, index) => i.length > 0 || index === nodes.length - 1)
      .join(PATH_SEPARATOR)
  }

  onKeyDown = (event: KeyboardEvent, data, state) => {
    this.showResults = true

    // event.persist()

    const code = keycode(event)

    const gtSign = event.shiftKey && code === '.'

    // don't move cursor for these
    const doNothing = ['enter', 'up', 'down']
    if (includes(doNothing, code)) {
      event.preventDefault()
      return state
    }

    if (code === 'backspace') {
      this.isCreatingNew = true
    }

    if (code === '/' || gtSign) {
      event.preventDefault()
      this.onCommitItem()
      return state
    }

    if (code === 'esc') {
      event.preventDefault()
      this.showResults = false
      return state
    }

    if (code === 'left' && this.selectedItem) {
      // don't move cursor
      if (this.selectedItemIndex === 0) {
        event.preventDefault()
        return state
      }

      event.preventDefault()
      return state
        .transform()
        .collapseToStartOfPreviousText()
        .collapseToEndOfPreviousText()
        .apply()
    }

    // if going right and there's more items in front of us
    if (
      code === 'right' &&
      this.selectedItem &&
      this.selectedItemIndex !== this.itemNodes.count() - 1
    ) {
      event.preventDefault()
      return state
        .transform()
        .collapseToEndOfNextText()
        .collapseToEndOfNextText()
        .apply()
    }

    // return state
  }

  onRight = () => {
    // only matters if you're navigating with arrow keys
    if (this.highlightIndex === -1) return

    const endPath = this.highlightedDocument.title

    this.onCommitItem(endPath)
  }

  setPath = debounce(async doc => {
    if (!doc) {
      log('no doc for setPath')
      return
    }
    this.setValue(this.getPathForDocs(await doc.getCrumbs()))
  }, 32)

  moveHighlight = (diff: number) => {
    this.highlightIndex += diff
    if (this.highlightIndex === -1)
      this.highlightIndex = this.searchResults.length - 1
    if (this.highlightIndex >= this.searchResults.length)
      this.highlightIndex = 0
  }

  navTo = doc => {
    if (!doc) {
      console.log('navTo called without value')
      return
    }
    this.showResults = false
    this.blur()
    Router.go(doc.url())
  }
}