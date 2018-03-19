import 'regenerator-runtime/runtime'
import 'babel-polyfill'

import { store, watch } from '@mcro/black/store'
import { sum, range, sortBy, flatten } from 'lodash'
import DB from './db'
import { splitSentences, wordMoversDistance, cosineSimilarity } from './helpers'
import summarize from './summarize'
import createKDTree from 'static-kdtree'
import wordVectors from './vectors.json'

// for some reason lodash's was acting strangely so I rewrote it
const sortedUniqBy = (xs, fn) => {
  const seen = {}
  return xs.filter(x => {
    const val = fn(x)
    if (seen[val]) {
      return false
    }

    seen[val] = true

    return true
  })
}

const sleep = ms => new Promise(res => setTimeout(res, ms))

const vecMean = xs => {
  if (xs.length === 0) {
    return []
  }

  return range(xs[0].length).map(
    dim => sum(xs.map(vec => vec[dim])) / xs.length,
  )
}

// TODO import from constants
const API_URL = 'http://localhost:3001'

const batchMapPromise = async (xs, fn, batchSize, callback = () => {}) => {
  let hasStopped = false
  const onStop = () => {
    hasStopped = true
  }

  const batches = Math.floor(xs.length / batchSize)
  let items = []
  for (const batch of range(batches)) {
    await sleep(80)
    if (hasStopped) {
      break
    }

    const start = batch * batchSize
    const end = (batch + 1) * batchSize
    const batchXs = await Promise.all(xs.slice(start, end).map(fn))

    items = [...items, ...batchXs]

    callback({ start, end, onStop, items })
  }

  return items
}

@store
class Search {
  paragraphs = []
  documents = []
  indexing = false
  totalIndexed = 0
  totalIndexedSentences = 0
  currentTotalSentences = 0
  totalDocuments = 0

  @watch
  indexedStatus = () =>
    `index: doc ${this.totalIndexed}/${this.totalDocuments} line ${
      this.totalIndexedSentences
    }/${this.currentTotalSentences} `

  getIndexingStatus = () => this.indexedStatus

  @watch indexedPercentage = () => this.totalIndexed / this.totalDocuments * 100

  @watch
  paragraphs = () =>
    flatten(
      this.documents.map(({ paragraphs }, index) =>
        paragraphs.map(sentences => ({
          document: index,
          sentences,
        })),
      ),
    )

  @watch
  space = () => {
    const vectors = []
    const metaData = []

    this.paragraphs.forEach((para, paragraphIndex) => {
      para.sentences.forEach((sentence, sentenceIndex) => {
        vectors.push(sentence.sentenceVector)
        metaData.push({ paragraphIndex, sentenceIndex })
      })
    })

    return {
      tree: new createKDTree(vectors),
      metaData,
    }
  }

  getEmbedding = async () => {
    return await (await fetch('/dist/vectors.json')).json()
  }

  async willMount() {
    self.indexer = this
    this.db = new DB()
  }

  getSentences = async paragraph => {
    const sentences = splitSentences(paragraph)

    return await Promise.all(
      sentences.map(async text => {
        const { vectors, sentenceVector } = await this.getWordVectors(text)
        return { text, vectors, sentenceVector }
      }),
    )
  }

  toDocument = async ({ title, text }, index) => {
    this.totalIndexedSentences = 0
    const paragraphTexts = text.split('\n')
    this.currentTotalSentences = paragraphTexts.length
    const paragraphs = await batchMapPromise(
      paragraphTexts,
      this.getSentences,
      2,
      ({ end }) => {
        this.totalIndexedSentences = end
      },
    )

    return {
      title,
      index,
      paragraphs,
    }
  }

  sentenceDistance = async (s, s2) => {
    const vectors = await this.getSentenceVector(s)
    return (
      cosineSimilarity(vectors, await this.getSentenceVector(s2)) /
      vectors.length
    )
  }

  setDocuments = async documentSources => {
    // lets keep the articles short for testing
    documentSources = documentSources
      .filter(({ text }) => text.length < 5000)
      .map(obj => {
        return {
          ...obj,
          text: summarize(obj.text),
        }
      })

    this.totalDocuments = documentSources.length
    this.indexing = true
    this.totalIndexed = 0
    await batchMapPromise(
      documentSources,
      this.toDocument,
      1,
      ({ end, items }) => {
        this.totalIndexed = end
        this.documentSources = documentSources.slice(0, end)
        this.documents = items
      },
    )

    this.indexing = false

    return true
  }

  getWordVectors = async sentence => {
    const hash = `word-vectors-${sentence}`
    const sentenceHash = `vectors-${sentence}`

    const cachedValue = await this.db.getItem(hash)
    if (cachedValue) {
      const cachedSentenceValue = await this.db.getItem(sentenceHash)
      return {
        vectors: JSON.parse(cachedValue),
        sentenceVector: JSON.parse(cachedSentenceValue),
      }
    }

    const vectors = await this.getVectors(sentence)
    const sentenceVector = vecMean(vectors)

    try {
      const str = JSON.stringify(vectors)
      const sentenceStr = JSON.stringify(sentenceVector)
      this.db.setItem(hash, str)
      this.db.setItem(sentenceHash, sentenceStr)
    } catch (err) {
      console.log('err is', err)
    }

    return { vectors, sentenceVector }
  }

  getSimpleSentenceVectors = async sentence => {
    const getWord = word => {
      return wordVectors[word]
    }

    const allVectors = sentence.split(' ').map(getWord)
    const vectors = allVectors.filter(_ => _)

    // take out empty ones
    const val = { sentenceVector: vecMean(vectors), vectors }
    return val
  }

  getSentenceVector = async sentence => {
    const hash = `vectors-${sentence}`

    const cachedValue = await this.db.getItem(hash)
    if (cachedValue) {
      return JSON.parse(cachedValue)
    }

    const vector = vecMean(await this.getVectors(sentence)).map(
      i => +i.toFixed(4),
    )

    try {
      const str = JSON.stringify(vector)
      this.db.setItem(hash, str)
    } catch (err) {
      console.log('err is', err)
    }

    return vector
  }

  getVectors = async sentence => {
    const url = `${API_URL}/sentence?sentence=${encodeURIComponent(sentence)}`

    const { values } = await (await fetch(url)).json()
    return values
  }

  search = async (query, options = { count: 10, onePerDoc: true }) => {
    if (!query) {
      return false
    }

    const start = +Date.now()
    this.lastQuery = query

    const { vectors, sentenceVector } = await this.getSimpleSentenceVectors(
      query,
    )

    // bail if we're out of date
    if (query !== this.lastQuery) {
      return false
    }

    const nearestNeighbors = this.space.tree
      .knn(sentenceVector, options.count * 3)
      .map(index => this.space.metaData[index])

    // bail if we're out of date
    if (query !== this.lastQuery) {
      return false
    }

    const sentences = sortBy(
      nearestNeighbors.map(({ sentenceIndex, paragraphIndex }, index) => {
        const paragraph = this.paragraphs[paragraphIndex]
        const sentence = paragraph.sentences[sentenceIndex]
        const documentIndex = paragraph.document
        // incorporate sentence distance into weighting
        const penalizeNearest = index / nearestNeighbors.length
        const distance =
          wordMoversDistance(vectors, sentence.vectors).total / vectors.length +
          0.2 * penalizeNearest
        const document = this.documentSources[documentIndex]

        const context = paragraph.sentences.map(({ text }) => ({
          active: text === sentence.text,
          text,
        }))

        return {
          document,
          documentIndex,
          distance,
          sentence: sentence.text,
          context,
          title: document.title,
          subtitle: `distance: ${('' + distance).slice(0, 7)}`,
          content: sentence.text,
        }
      }),
      'distance',
    )

    const results = sortedUniqBy(sentences, _ => _.documentIndex).slice(
      0,
      options.count,
    )

    return { performance: +Date.now() - start, results }
  }
}

const search = new Search()

onmessage = async e => {
  if (!e.data || !e.data.uuid) {
    return false
  }

  const { name, args, uuid } = e.data

  let data = search[name](args)

  if (data && data.then) {
    data = await data
  }

  postMessage({ uuid, data })
}