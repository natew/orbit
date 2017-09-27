import { watch } from '@mcro/black'
import { Event, Thing } from '~/app'
import moment from 'moment'
import { includes, debounce, without } from 'lodash'

const convos = []
const nameToLogin = {
  nate: 'natew',
  me: 'natew',
  nick: 'ncammarata',
  steel: 'steelbrain',
}

const loginToName = Object.keys(nameToLogin).reduce(
  (acc, name) => ({
    [nameToLogin[name]]: name,
    ...acc,
  }),
  {}
)

export default class FeedStore {
  isOpen = false
  filters = {
    type: null,
    search: '',
    startDate: null,
    endDate: null,
    people: [],
  }

  brushDomain = null

  setBrush = debounce(domain => {
    this.brushDomain = domain
    this.setFilter('startDate', +new Date(domain.x[0]))
    this.setFilter('endDate', +new Date(domain.x[1]))
  }, 20)

  setFilter = (key, val) => {
    this.filters = {
      ...this.filters,
      [key]: val,
    }
  }

  types = [
    { name: 'all', type: null, icon: 'list' },
    { name: 'cal', icon: 'cal' },
    { name: 'github', icon: 'github' },
    { name: 'slack', type: 'convo', icon: 'slack' },
    { name: 'docs', icon: 'hard' },
    { name: 'jira', icon: 'atl' },
    // { name: 'tasks', type: 'task', icon: 'github' },
  ]

  get currentLogins() {
    return this.filters.people.map(name => nameToLogin[name])
  }

  toggleLogin = login => {
    this.togglePerson(loginToName[login])
  }

  togglePerson = name => {
    console.log('toggling person', name)
    this.setFilter(
      'people',
      includes(this.filters.people, name)
        ? without(this.filters.people, name)
        : [...this.filters.people, name]
    )
  }

  willMount() {
    const { people, person } = this.props.paneStore.data
    this.setFilter(people ? people : [person])

    this.react(
      () => this.props.paneStore.data.people,
      () => {
        this.setFilter('people', people)
      },
      true
    )

    this.react(
      () => this.props.paneStore.data.service,
      () => {
        const { service, startDate, endDate } = this.props.paneStore.data
        this.setFilter(
          'type',
          (service === 'issues' ? 'task' : service) || null
        )
        if (startDate) {
          this.setFilter('startDate', +new Date(startDate))
        }

        if (endDate) {
          this.setFilter('endDate', +new Date(endDate))
        }
      },
      true
    )

    this.react(
      () => this.filters,
      () => {
        this.props.barStore.filters = this.filters
      }
    )

    this.react(
      () => this.activeItems.length,
      () => {
        this.props.barStore.resultCount = this.activeItems.length
      }
    )
  }

  get titleDesc() {
    const { type, startDate, endDate } = this.filters
    return `${this.activeItems.length} ${(type || 'item') + 's'}`
  }

  get titleSubdesc() {
    const { type, startDate, endDate } = this.filters
    if (!startDate || !endDate) return ''

    const format = ts => moment(new Date(ts)).format('MMM Do')

    return `${format(startDate)} - ${format(endDate)}`
  }

  things = Thing.find()

  @watch
  events: ?Array<Event> = (() =>
    Event.find({ created: { $ne: null } })
      .sort({ created: 'desc' })
      .limit(20): any)

  get allItems() {
    return [...(this.events || []), ...(this.things || []), ...convos]
  }

  get results(): Array<Event> {
    return this.activeItems.map(i => ({ ...i, showChild: false }))
  }

  get calendarActive() {
    return this.allActive || this.filters.type === 'calendar'
  }

  get allActive() {
    return this.filters.type === null
  }

  // separated so chart can use it
  get currentChart() {
    const { filters: { type, search } } = this

    if (this.allActive) return this.allItems

    return this.allItems.filter(item => {
      if (type && (item.type || item.name) !== type) {
        return false
      }

      const itemAuthors = item.authors || [item.author]

      if (item.type === 'task') {
        if (
          this.hasPeople &&
          !includes(this.currentLogins, item.data.author.login)
        ) {
          return false
        }
      } else {
        if (
          this.hasPeople &&
          itemAuthors.filter(author => includes(this.filters.people, author))
            .length === 0
        ) {
          return false
        }
      }

      if (
        search.length > 0 &&
        (item.title || item.data.text || '').indexOf(search) === -1
      ) {
        return false
      }

      return true
    })
  }

  get hasPeople() {
    return this.filters.people.length > 0
  }

  createdAt = item => {
    return item.date
      ? +new Date(item.date)
      : +new Date(item.data.createdAt || item.data.created_at)
  }

  get activeItems() {
    const { filters: { startDate, endDate } } = this

    const val = this.currentChart
      .filter(item => {
        const itemDate = this.createdAt(item)

        if (
          startDate &&
          endDate &&
          (itemDate < startDate || itemDate > endDate)
        ) {
          return false
        }

        return true
      })
      .sort((a, b) => this.createdAt(b) - this.createdAt(a))

    // console.timeEnd('calculating active items')

    return val
  }
}