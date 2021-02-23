import mongoose from '@/config/DBHelpler'

const Schema = mongoose.Schema

const RecordsSchema = new Schema({
  code: { type: Number },
  url: { type: String },
  end: { type: String },
  host: { type: String },
  clientIp: { type: String },
  uuid: { type: String },
  requestId: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  createTime: { type: String, default: '' },
  xForwardedHost: { type: String, default: '' },
  xForwardedFor: { type: String, default: '' },
  xRealIp: { type: String, default: '' }
})

RecordsSchema.pre('save', function (next) {
  this.createTime = new Date().getTime()
  next()
})

RecordsSchema.statics = {
}

const Records = mongoose.model('records', RecordsSchema)

export default Records
