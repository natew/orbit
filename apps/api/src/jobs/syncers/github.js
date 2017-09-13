// @flow
import { store, watch } from '@mcro/black/store'
import { Setting, Thing, Event, Job } from '@mcro/models'
import typeof { User } from '@mcro/models'
import { createApolloFetch } from 'apollo-fetch'
import { omit, once, flatten } from 'lodash'
import { URLSearchParams } from 'url'
import Syncer from './syncer'

const type = 'github'

@store
export default class GithubSync extends Syncer {
  static type = type
  static jobs = {
    issues: { every: 60 * 60 * 6 },
    feed: { every: 60 },
  }

  user: User
  lastSyncs = {}

  // oldest setting
  @watch
  setting = () =>
    Setting.findOne({ type, userId: this.user.id }).sort('createdAt')

  get token(): string {
    return (this.user.github && this.user.github.auth.accessToken) || ''
  }

  start = () => {
    if (!this.user.github) {
      console.log('No github credentials found for user')
      return
    }
  }

  run = (job: Job): Promise<void> => {
    return new Promise((resolve, reject) => {
      const runJob = once(async () => {
        if (this.setting) {
          this.validateSetting()
        }

        if (job.action) {
          try {
            console.log('running job', job.action)
            await this.runJob(job.action)
          } catch (error) {
            reject(error)
          }
          resolve()
        } else {
          reject(`No action found on job ${job.id}`)
        }
      })

      // wait for setting before running
      this.watch(async () => {
        if (this.setting) {
          if (this.setting.activeOrgs) {
            runJob()
          } else {
            console.log('no orgs')
          }
        }
      })
    })
  }

  validateSetting = () => {
    // ensures properties on setting
    // TODO move this into GithubSetting model
    if (!this.setting.values.lastSyncs) {
      this.setting.merge({
        values: {
          lastSyncs: {},
        },
      })
    }
  }

  runJob = async (action: string) => {
    try {
      switch (action) {
        case 'issues':
          return await this.runIssues()
        case 'feed':
          return await this.runFeed()
      }
    } catch (err) {
      console.error(err)
    }
  }

  runFeed = async () => {
    if (!this.setting) {
      throw new Error('No setting')
    }
    if (this.setting.activeOrgs) {
      await Promise.all(this.setting.activeOrgs.map(this.syncFeed))
    }
  }

  writeLastSyncs = async () => {
    if (!this.setting) {
      throw new Error('No setting')
    }
    const { lastSyncs } = this
    await this.setting.mergeUpdate({
      values: {
        lastSyncs,
      },
    })
  }

  syncFeed = async (orgLogin: string) => {
    console.log('SYNC feed for org', orgLogin)
    const repoEvents = await this.getNewEvents(orgLogin)
    const created = await this.insertEvents(repoEvents)
    console.log('Created', created.length, 'feed events')
    await this.writeLastSyncs()
  }

  getRepoEventsPage = async (org, repoName, page): Promise<?Array<Object>> => {
    return await this.fetch(`/repos/${org}/${repoName}/events`, {
      search: { page },
    })
  }

  getRepoEvents = async (
    org: string,
    repoName: string,
    page: number = 0
  ): Promise<?Array<Object>> => {
    let events = await this.getRepoEventsPage(org, repoName, page)

    if (events && !!events.message) {
      // error format from github
      console.log('error getting events', events)
      return null
    }

    // recurse to get older if necessary
    if (events && events.length) {
      let moreEvents = true
      let last

      while (moreEvents) {
        const prev = last
        last = events[events.length - 1]

        if (prev && last && prev.id === last.id) {
          moreEvents = false
          continue
        }

        const existingLastEvent = await Event.get(last.id)

        if (!existingLastEvent) {
          const nextEvents = await this.getRepoEventsPage(
            org,
            repoName,
            page + 1
          )
          if (nextEvents) {
            if (nextEvents.message) {
              console.log('nextEvents.message', nextEvents.message)
              moreEvents = false
            } else {
              events = [...events, ...nextEvents]
            }
          } else {
            moreEvents = false
          }
        }
      }
    }

    return events
  }

  getNewEvents = async (org: string): Promise<Array<Object>> => {
    const repos = this.setting.activeOrgs
    // const repos = await this.fetch(`/orgs/${org}/repos`)
    if (Array.isArray(repos)) {
      return flatten(
        await Promise.all(repos.map(name => this.getRepoEvents(org, name)))
      ).filter(x => !!x)
    } else {
      console.log('No repos', repos)
    }
    return Promise.resolve([])
  }

  insertEvents = async (allEvents: Array<Object>): Promise<Array<Object>> => {
    const createdEvents = []
    for (const event of allEvents) {
      const id = `${event.id}`
      const created = event.created_at || ''
      const updated = event.updated_at || created
      // stale event removal
      const stale = await Event.get({ id, created: { $ne: created } })
      if (stale) {
        console.log('Removing stale event', id)
        await stale.remove()
      }
      if (
        !stale &&
        !await Event.get(updated ? { id, updated } : { id, created })
      ) {
        const inserted = await Event.update({
          id,
          integration: 'github',
          type: event.type,
          author: event.actor.login,
          org: event.org.login,
          parentId: event.repo.name,
          created,
          updated,
          data: event,
        })
        createdEvents.push(inserted)
      }
    }
    return createdEvents
  }

  runIssues = async () => {
    if (!this.setting) {
      throw new Error('No setting')
    }
    if (!this.setting.activeOrgs) {
      throw new Error('User hasnt selected any orgs in settings')
    }
    const createdIssues = flatten(
      await Promise.all(this.setting.activeOrgs.map(this.syncIssues))
    )
    console.log('Created', createdIssues ? createdIssues.length : 0, 'issues')
  }

  syncIssues = async (orgLogin: string): Promise<?Array<Object>> => {
    const results = await this.graphFetch({
      query: `
      query AllIssues {
        organization(login: "${orgLogin}") {
          repositories(first: 20) {
            edges {
              node {
                id
                name
                issues(first: 100) {
                  edges {
                    node {
                      id
                      title
                      body
                      bodyText
                      updatedAt
                      createdAt
                      author {
                        avatarUrl
                        login
                      }
                      labels(first: 10) {
                        edges {
                          node {
                            name
                          }
                        }
                      }
                      comments(first: 100) {
                        edges {
                          node {
                            author {
                              avatarUrl
                              login
                            }
                            createdAt
                            body
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    })

    if (results.message) {
      console.error('Error doing fetch', results)
      return null
    }

    const repositories = results.data.organization.repositories.edges
    if (!repositories || !repositories.length) {
      console.log('no repos found in response', repositories)
      return null
    }

    const createdIssues = []
    const unwrap = obj => {
      obj.labels = obj.labels.edges.map(edge => edge.node)
      obj.comments = obj.comments.edges.map(edge => edge.node)
      return obj
    }

    for (const repositoryNode of repositories) {
      const repository = repositoryNode.node
      const issues = repository.issues.edges.map(edge => edge.node)

      if (!issues || !issues.length) {
        console.log('no issues found for repo', repository.name)
        continue
      }

      for (const issue of issues) {
        const data = unwrap(omit(issue, ['bodyText']))
        const id = `${issue.id}`
        const created = issue.createdAt || ''
        const updated = issue.updatedAt || created
        // stale thing removal
        const stale = await Thing.get({ id, created: { $ne: created } })
        if (stale) {
          console.log('Removing stale event', id)
          await stale.remove()
        }
        if (
          stale ||
          !await Thing.get(updated ? { id, updated } : { id, created })
        ) {
          const inserted = await Thing.update({
            id,
            integration: 'github',
            type: 'issue',
            title: issue.title,
            body: issue.bodyText,
            data,
            orgName: orgLogin,
            parentId: repository.name,
            created,
            updated,
          })
          createdIssues.push(inserted)
        }
      }
    }

    return createdIssues
  }

  graphFetch = createApolloFetch({
    uri: 'https://api.github.com/graphql',
  }).use(({ request, options }, next) => {
    if (!options.headers) {
      options.headers = {}
    }
    options.headers['Authorization'] = `bearer ${this.token}`
    next()
  })

  epochToGMTDate = (epochDate: number | string): string => {
    const date = new Date(0)
    date.setUTCSeconds(epochDate)
    return date.toGMTString()
  }

  fetchHeaders = (uri: string, extraHeaders: Object = {}) => {
    const lastSync = this.setting.values.lastSyncs[uri]
    if (lastSync && lastSync.date) {
      const modifiedSince = this.epochToGMTDate(lastSync.date)
      const etag = lastSync.etag ? lastSync.etag.replace('W/', '') : ''
      return new Headers({
        'If-Modified-Since': modifiedSince,
        'If-None-Match': etag,
        ...extraHeaders,
      })
    }
    return new Headers(extraHeaders)
  }

  fetch = async (path: string, options: Object = {}) => {
    const { search, headers, ...opts } = options
    if (!this.setting) {
      throw new Error('No setting')
    }

    // setup options
    this.validateSetting()
    const syncDate = Date.now()
    const requestSearch = new URLSearchParams(
      Object.entries({ ...search, access_token: this.token })
    )
    const uri = `https://api.github.com${path}?${requestSearch.toString()}`
    const requestHeaders = this.fetchHeaders(uri, headers)

    console.log('Fetching', uri)
    const res = await fetch(uri, {
      headers: requestHeaders,
      ...opts,
    })

    // update lastSyncs
    this.lastSyncs[uri] = {
      date: syncDate,
      etag: res.headers.get('etag'),
      rateLimit: res.headers.get('x-ratelimit-limit'),
      rateLimitRemaining: res.headers.get('x-ratelimit-remaining'),
      rateLimitReset: res.headers.get('x-rate-limit-reset'),
      pollInterval: res.headers.get('x-poll-interval'),
    }

    // if not modified return null
    if (res.status === 304) {
      console.log('Not modified', path)
      return null
    }

    const text = await res.text()
    return JSON.parse(text)
  }
}
