import mongoose from '@/config/DBHelpler'

const Schema = mongoose.Schema

const LinksSchema = new Schema({
  title: { type: String, default: '' },
  link: { type: String, default: '' },
  type: { type: String, default: 'link' },
  isTop: { type: Number, default: 0 },
  sort: { type: Number, default: 0 }
}, { timestamps: { createdAt: 'created', updatedAt: 'updated' } })

const Links = mongoose.model('links', LinksSchema)

export default Links
