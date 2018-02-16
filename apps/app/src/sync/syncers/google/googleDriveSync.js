// @flow
import { Thing } from '~/app'
import { createInChunks } from '~/sync/helpers'
import debug from 'debug'

const log = debug('sync')
const sleep = ms => new Promise(res => setTimeout(res, ms))

export default class GoogleDriveSync {
  fetch2 = (path, opts) => this.helpers.fetch(`/drive/v2${path}`, opts)
  fetch = (path, opts) => this.helpers.fetch(`/drive/v3${path}`, opts)

  constructor({ setting, token, helpers }) {
    this.setting = setting
    this.token = token
    this.helpers = helpers
  }

  run = async () => {
    await this.syncFiles()
  }

  async syncFeed() {
    const changes = await this.getChanges()
    if (changes && changes.changes) {
      for (const change of changes) {
        console.log('change:', change.fileId, change)
      }
    }
  }

  async syncFiles() {
    const files = await this.getFiles()
    const results = await createInChunks(files, file => this.createFile(file))
    log('syncFiles', results)
    return results
  }

  async createFile(info: Object) {
    const { name, contents, ...data } = info
    const created = info.createdTime
    const updated = info.modifiedTime
    return await Thing.findOrUpdate({
      id: info.id,
      integration: 'google',
      type: 'doc',
      title: name,
      body: contents,
      data,
      orgName: info.spaces ? info.spaces[0] : '',
      parentId: info.parents ? info.parents[0] : '',
      created,
      updated,
    })
  }

  async getRevisions(fileId: string) {
    const { revisions } = await this.fetch(`/files/${fileId}/revisions`, {
      query: {
        pageSize: 1000,
      },
    })
    return await Promise.all(
      revisions.map(({ id }) => this.getRevision(fileId, id))
    )
  }

  async getRevision(fileId: string, revisionId: string) {
    return await this.fetch(`/files/${fileId}/revisions/${revisionId}`, {
      query: {
        fields: ['lastModifyingUser', 'size', 'mimeType', 'modifiedTime'],
      },
    })
  }

  async getChanges({ max = 5000, maxRequests = 20 } = {}) {
    let { changes, newStartPageToken } = await this.fetchChanges()
    let requests = 0
    while (changes.length < max && requests < maxRequests) {
      requests++
      newStartPageToken--
      const next = await this.fetchChanges(newStartPageToken)
      changes = [...changes, ...next.changes]
    }
    return changes
  }

  async fetchChanges(lastPageToken: string, total = 1000) {
    let pageToken = lastPageToken
    if (!pageToken) {
      pageToken = (await this.fetch('/changes/startPageToken')).startPageToken
    }
    const query = {
      supportsTeamDrives: true,
      includeRemoved: true,
      includeTeamDriveItems: true,
      pageSize: Math.min(1000, total),
      spaces: 'drive',
    }
    if (pageToken) {
      query.pageToken = pageToken
    }
    return await this.fetch('/changes', {
      query,
    })
  }

  async getFiles(pages = 1, query?: Object, fileQuery?: Object) {
    log(`Getting ${pages} pages of files`)
    const files = await this.getFilesBasic(pages, query)
    // just docs
    const docs = files.filter(
      file => file.mimeType === 'application/vnd.google-apps.document'
    )
    const fileIds = docs.map(file => file.id)
    const perSecond = 5
    let fetched = 0
    let response = []
    while (fetched < fileIds.length) {
      const next = await this.getFilesWithAllInfo(
        fileIds.slice(fetched, fetched + perSecond),
        fileQuery
      )
      log('getFiles', next, fetched)
      response = [...response, ...next]
      fetched += perSecond
      await sleep(1000)
    }
    return response
  }

  async getFilesWithAllInfo(ids: Array<number>, fileQuery?: Object) {
    const meta = await Promise.all(ids.map(id => this.getFile(id, fileQuery)))
    const contents = await Promise.all(ids.map(id => this.getFileContents(id)))
    // zip
    return meta.map((file, i) => ({ ...file, contents: contents[i] }))
  }

  async getFilesBasic(pages = 1, query: Object = {}) {
    let all = []
    let fetchedPages = 0
    while (fetchedPages < pages) {
      fetchedPages++
      const res = await this.fetchFiles(query)
      if (res) {
        all = [...all, ...res.files]
        if (res.nextPageToken) {
          query.pageToken = res.nextPageToken
        }
      } else {
        console.error('No res', res, query)
      }
    }
    return all
  }

  async fetchFiles(query?: Object) {
    return await this.fetch('/files', {
      query: {
        orderBy: [
          'modifiedByMeTime desc',
          'modifiedTime desc',
          'sharedWithMeTime desc',
          'viewedByMeTime desc',
        ],
        ...query,
      },
    })
  }

  async getFile(id: string, query?: Object) {
    return await this.fetch(`/files/${id}`, {
      query: {
        fields: [
          'id',
          'name',
          'mimeType',
          'description',
          'starred',
          'trashed',
          'parents',
          'properties',
          'spaces',
          'version',
          'webContentLink',
          'iconLink',
          'thumbnailLink',
          'viewedByMe',
          'viewedByMeTime',
          'createdTime',
          'modifiedTime',
          'sharingUser',
          'owners',
          'shared',
          'ownedByMe',
          'folderColorRgb',
          'originalFilename',
          'fileExtension',
          'size',
          'capabilities',
          'modifiedByMe',
          'teamDriveId',
        ],
        ...query,
      },
    })
  }

  async getFileContents(id: string) {
    return await this.fetch(`/files/${id}/export`, {
      type: 'text',
      query: {
        mimeType: 'text/plain',
        alt: 'media',
      },
    })
  }

  async getTeamDrives() {
    return await this.fetch('/teamdrives')
  }

  async getComments(fileId: string) {
    return await this.fetch(`/files/${fileId}/comments`, {
      query: {
        pageSize: 1000,
      },
    })
  }

  async getReplies(fileId: string, commentId: string) {
    return await this.fetch(`/files/${fileId}/comments/${commentId}/replies`, {
      query: {
        pageSize: 1000,
      },
    })
  }
}