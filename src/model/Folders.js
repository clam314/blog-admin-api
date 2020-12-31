import mongoose from '@/config/DBHelpler'

const Schema = mongoose.Schema

const FoldersSchema = new Schema({
  _id: { type: Schema.Types.ObjectId },
  uid: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  status: { type: Number, default: 0 },
  createTime: { type: String, default: '' },
  updateTime: { type: String, default: '' }
})

FoldersSchema.pre('save', function (next) {
  this.createTime = new Date()
  next()
})

FoldersSchema.pre('update', function (next) {
  this.updateTime = new Date()
  next()
})

FoldersSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Error: Mongoose has a duplicate key.'))
  } else {
    next(error)
  }
})

const Folders = mongoose.model('folders', FoldersSchema)

export default Folders
