import mongoose from '@/config/DBHelpler'

const Schema = mongoose.Schema

const FoldersSchema = new Schema({
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

FoldersSchema.pre('save', function (next) {
  const time = new Date().getTime()
  this.createTime = time
  this.updateTime = time
  next()
})

FoldersSchema.pre('update', function (next) {
  this.updateTime = new Date().getTime()
  next()
})

FoldersSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Error: Mongoose has a duplicate key.'))
  } else {
    next(error)
  }
})

FoldersSchema.virtual('fid').get(function () {
  return this._id
})

const Folders = mongoose.model('folders', FoldersSchema)

export default Folders
