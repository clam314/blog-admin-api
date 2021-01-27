import mongoose from '@/config/DBHelpler'

const Schema = mongoose.Schema

const RecordsSchema = new Schema({
  _id: { type: Schema.Types.ObjectId },
  code: { type: Number },
  url: { type: String },
  host: { type: String },
  clientIp: { type: String },
  uuid: { type: String },
  requestId: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  createTime: { type: String, default: '' }
})

RecordsSchema.pre('save', function (next) {
  this.createTime = new Date().getTime()
  next()
})

const Records = mongoose.model('records', RecordsSchema)

export default Records
