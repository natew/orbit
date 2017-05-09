import { compile, str } from './properties'

export default class BaseModel {
  constructor({ defaultSchema, defaultProps }) {
    this.create = this.create.bind(this)
    this.defaultSchema = defaultSchema
    this.compiledSchema = {
      ...this.defaultSchema,
      ...this.settings,
      ...compile(this.props),
    }
  }

  get hasTimestamps() {
    return this.constructor.props.timestamps === true
  }

  get now() {
    return new Date().toISOString()
  }

  get props() {
    const { timestamps, ...props } = this.constructor.props
    if (timestamps) {
      return {
        ...props,
        createdAt: str.datetime,
        updatedAt: str.datetime,
      }
    }
    return props
  }

  getDefaultProps(props) {
    const { defaultProps } = this.constructor
    return typeof defaultProps === 'function'
      ? defaultProps(props)
      : defaultProps || {}
  }

  get title() {
    return ((this.settings && this.settings.title) || this.constructor.name)
      .toLowerCase()
  }

  get compiledMethods() {
    return {
      ...this.methods,
      delete() {
        return this.collection
          .findOne(this._id)
          .exec()
          .then(doc => doc && doc.remove())
      },
    }
  }

  async connect(db) {
    this.db = db
    this.collection = await db.collection({
      name: this.title,
      schema: this.compiledSchema,
      statics: this.statics,
      methods: this.compiledMethods,
    })

    // shim add pouchdb-validation
    this.collection.pouch.installValidationMethods()

    // create index
    if (this.settings.index) {
      await this.collection.pouch.createIndex({ fields: this.settings.index })
    }

    // setup hooks
    this.hooks = this.hooks || {}

    // auto timestamps
    if (this.hasTimestamps) {
      const ogInsert = this.hooks.preInsert
      this.hooks.preInsert = doc => {
        doc.createdAt = this.now
        doc.updatedAt = this.now
        if (ogInsert) {
          ogInsert.apply(this, arguments)
        }
      }

      const ogSave = this.hooks.preSave
      this.hooks.preSave = doc => {
        doc.updatedAt = this.now
        if (ogSave) {
          ogSave.apply(this, arguments)
        }
      }
    }

    Object.keys(this.hooks).forEach(hook => {
      this.collection[hook](this.hooks[hook])
    })
  }

  // helpers

  create(object = {}) {
    const properties = {
      ...this.getDefaultProps(object),
      ...object,
    }
    console.log('creating', properties)
    return this.collection.insert(properties)
  }
}
