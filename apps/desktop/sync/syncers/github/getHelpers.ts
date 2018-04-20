const allSyncs = {}

export default setting => ({
  fetchHeaders(uri: string, extraHeaders: Object = {}) {
    const lastSync = setting.values.lastSyncs[uri]
    if (lastSync && lastSync.date) {
      const modifiedSince = this.epochToGMTDate(lastSync.date)
      const etag = lastSync.etag ? lastSync.etag.replace('W/', '') : ''
      // @ts-ignore
      return new Headers({
        'If-Modified-Since': modifiedSince,
        'If-None-Match': etag,
        ...extraHeaders,
      })
    }
    // @ts-ignore
    return new Headers(extraHeaders)
  },
  async fetch(path: string, options: Object = {}) {
    if (!this.token) {
      console.log('no App.sync.github.feed.token')
      return null
    }
    // @ts-ignore
    const { search, headers, force, ...opts } = options
    // setup options
    const syncDate = Date.now()
    const requestSearch = new URLSearchParams(
      Object.entries({ ...search, access_token: this.token }),
    )
    const uri = `https://api.github.com${path}?${requestSearch.toString()}`
    // ensure lastsyncs
    if (!setting.values.lastSyncs) {
      await this.writeLastSyncs()
    }
    const requestHeaders = force ? null : this.fetchHeaders(uri, headers)
    if (requestHeaders) {
      opts.headers = requestHeaders
    }
    const res = await fetch(uri, opts)
    // update lastSyncs
    allSyncs[uri] = {
      date: syncDate,
      etag: res.headers.get('etag'),
      rateLimit: res.headers.get('x-ratelimit-limit'),
      rateLimitRemaining: res.headers.get('x-ratelimit-remaining'),
      rateLimitReset: res.headers.get('x-rate-limit-reset'),
      pollInterval: res.headers.get('x-poll-interval'),
    }
    // if not modified return null
    if (res.status === 304) {
      return null
    }
    const text = await res.text()
    return JSON.parse(text)
  },
  epochToGMTDate: (epochDate: number | string): string => {
    const date = new Date(0)
    date.setUTCSeconds(+epochDate)
    return date.toGMTString()
  },
  async writeLastSyncs(lastSyncs = allSyncs) {
    setting.values = {
      ...setting.values,
      lastSyncs,
    }
    await setting.save()
  },
})