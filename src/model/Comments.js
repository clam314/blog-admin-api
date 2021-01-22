import mongoose from '@/config/DBHelpler'
// TODO 待添加评论功能
const Schema = mongoose.Schema

const CommentsSchema = new Schema({
  uid: { type: String, ref: 'User' },
  name: { type: String },
  status: { type: Number, default: 0 },
  createTime: { type: String, default: '' },
  updateTime: { type: String, default: '' }
}, {
  toJSON: { virtuals: true },
  toObject: { getters: true },
  id: false,
  versionKey: false
})

CommentsSchema.pre('save', function (next) {
  const time = new Date().getTime()
  this.createTime = time
  this.updateTime = time
  next()
})

CommentsSchema.pre('update', function (next) {
  this.updateTime = new Date().getTime()
  next()
})

CommentsSchema.virtual('fid').get(function () {
  return this._id
})

const Comments = mongoose.model('comments', CommentsSchema)

export default Comments
