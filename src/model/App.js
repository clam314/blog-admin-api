import mongoose from '@/config/DBHelpler'

const Schema = mongoose.Schema

const AppsSchema = new Schema({
  _id: { type: Schema.Types.ObjectId },
  appKey: { type: String },
  appSecret: { type: String },
  status: { type: Number, default: 0 },
  createTime: { type: String, default: '' },
  updateTime: { type: String, default: '' }
})

AppsSchema.pre('save', function (next) {
  const time = new Date().getTime()
  this.createTime = time
  this.updateTime = time
  next()
})

AppsSchema.pre('update', function (next) {
  this.updateTime = new Date().getTime()
  next()
})

const Apps = mongoose.model('apps', AppsSchema)

export default Apps
