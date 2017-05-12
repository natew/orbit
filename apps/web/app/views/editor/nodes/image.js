import { node, view } from '~/helpers'
import { Image } from '@jot/models'

const readFile = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      resolve(reader.result)
    })
    reader.addEventListener('error', () => {
      reject(reader.error)
    })
    reader.readAsDataURL(file)
  })

class ImageNodeStore {
  src = null
  loading = false

  start() {
    this.watch(async () => {
      this.src = await this.getSrc(this.props.node.data)
    })
  }

  getSrc = async data => {
    if (data.get('file')) {
      const file = data.get('file')
      this.saveImage(file)
      return await readFile(file)
    }
    if (data.get('imageId')) {
      const image: Image = await Image.get(data.get('imageId')).exec()
      const src = await image.getAttachment()
      return src
    }
  }

  saveImage = async file => {
    if (this.loading) return
    this.loading = true
    const { doc } = this.props.editorStore
    const image = await doc.addImage(file)
    // save ID to doc
    this.props.onChange({ imageId: image._id })
    this.loading = false
  }
}

@node
@view({
  store: ImageNodeStore,
})
export default class ImageNode {
  render({ attributes, store }) {
    if (!store.src) {
      return <span>Loading...</span>
    }
    return <img {...attributes} src={store.src} />
  }
}
