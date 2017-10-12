import { find } from 'lodash'
import { SHORTCUTS } from '~/stores/rootStore'
import Mousetrap from 'mousetrap'
import { OS } from '~/helpers'
import StackStore from './stackStore'
import { debounce } from 'lodash'

const peeks = [
  'remind',
  'send',
  'attach',
  'discuss',
  'assign',
  'update',
  'new',
  'issues',
  'docs',
].sort()

export default class HomeStore {
  stack = new StackStore([{ type: 'main' }])
  inputRef = null
  search = ''
  textboxVal = ''
  fullscreen = false
  traps = {}

  willMount() {
    window.homeStore = this
    this.attachTrap('window', window)
    this._watchFocusBar()
    this._watchInput()
  }

  _watchInput() {
    let lastChar = null
    this.watch(() => {
      const char = this.search[this.search.length - 1]
      if (lastChar && this.search.length === 0) {
        this.stack.navigate({
          type: 'main',
        })
      }
      lastChar = char
    })
  }

  _watchFocusBar() {
    let lastActiveCol = null
    this.watch(() => {
      if (this.activeCol === 0 && lastActiveCol !== 0) {
        this.focusBar()
      }
      if (this.activeCol !== 0 && lastActiveCol === 0) {
        this.blurBar()
      }
      lastActiveCol = this.activeCol
    })
  }

  get peekItem() {
    return find(peeks, peek => peek.indexOf(this.search) === 0)
  }

  onInputRef = el => {
    this.inputRef = el
    this.attachTrap('bar', el)
  }

  focusBar = () => {
    if (this.inputRef) {
      this.inputRef.focus()
      this.inputRef.select()
    }
  }

  onSearchChange = e => {
    this.textboxVal = e.target.value
    this.setSearch(e.target.value)
  }

  setSearch = debounce(text => {
    this.search = text
  }, 200)

  attachTrap(attachName, el) {
    this.traps[attachName] = new Mousetrap(el)
    for (const name of Object.keys(SHORTCUTS)) {
      const chord = SHORTCUTS[name]
      this.traps[attachName].bind(chord, event => {
        this.emit('shortcut', name)
        if (this.actions[name]) {
          this.actions[name](event)
        }
      })
    }
  }

  blurBar() {
    this.inputRef && this.inputRef.blur()
  }

  actions = {
    down: e => {
      e.preventDefault()
      this.stack.down()
    },
    up: e => {
      e.preventDefault()
      this.stack.up()
    },
    esc: e => {
      if (this.search === '') {
        e.preventDefault()
        OS.send('bar-hide')
      }
    },
    cmdA: () => {
      this.inputRef.select()
    },
    enter: e => {
      e.preventDefault()
      if (this.stack.selected.static) {
        console.log('static item, no action')
        return
      }
      if (this.stack.selected.onSelect) {
        this.stack.selected.onSelect()
      } else {
        const schema = JSON.stringify(this.stack.selected)
        OS.send('bar-goto', `http://jot.dev/master?schema=${schema}`)
      }
    },
    right: e => {
      e.preventDefault()
      this.stack.right()
    },
    left: e => {
      e.preventDefault()
      this.stack.left()
    },
    fullscreen: () => {
      this.fullscreen = !this.fullscreen
    },
  }
}