import mongoose from '@/config/DBHelpler'

const Schema = mongoose.Schema

const HistorySchema = new Schema({
  tid: { type: String, ref: 'Articles' },
  title: { type: String },
  content: { type: String, default: '' },
  contentHtml: { type: String, default: '' },
  status: { type: Number, default: 0 },
  createTime: { type: String, default: '' },
  updateTime: { type: String, default: '' }
}, {
  toJSON: { virtuals: true },
  toObject: { getters: true },
  id: false,
  versionKey: false
})

HistorySchema.pre('save', function (next) {
  const time = new Date().getTime()
  this.createTime = time
  this.updateTime = time
  next()
})

HistorySchema.pre('update', function (next) {
  this.updateTime = new Date().getTime()
  next()
})

HistorySchema.virtual('hid').get(function () {
  return this._id
})

HistorySchema.statics = {
  findByTid (tid) {
    return this.find({ tid: tid, status: 0 })
  },

  saveHistory (tid, title, content, contentHtml) {
    try {
      const newHistory = new History()
      newHistory.tid = tid
      newHistory.title = title
      newHistory.content = content
      newHistory.contentHtml = contentHtml
      return newHistory.save()
    } catch (e) {
      return null
    }
  }
}

const History = mongoose.model('history', HistorySchema)

export default History
