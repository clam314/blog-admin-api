import mongoose from '@/config/DBHelpler'
import User from '@/model/User'
import Folders from '@/model/Folders'

const Schema = mongoose.Schema

const ArticlesSchema = new Schema({
  uid: { type: String, ref: 'User' },
  fid: { type: String, ref: 'User' },
  title: { type: String },
  status: { type: Number, default: 0 },
  createTime: { type: String, default: '' },
  updateTime: { type: String, default: '' },
  description: { type: String, default: '' },
  des_image: { type: String, default: '' },
  content: { type: String, default: '' },
  contentHtml: { type: String, default: '' },
  file_type: { type: String, default: 'md' },
  published: { type: Number, default: 0 },
  private: { type: Number, default: 0 },
  reads: { type: Number, default: 0 },
  like: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  converse: { type: Number, default: 0 },
  isTop: { type: Number, default: 0 },
  sort: { type: Number, default: 0 },
  tags: { type: [String], default: [] }
}, {
  toJSON: { virtuals: true },
  toObject: { getters: true },
  id: false,
  versionKey: false
})

ArticlesSchema.pre('save', function (next) {
  const time = new Date().getTime()
  if (!this.createTime) {
    this.createTime = time
  }
  this.updateTime = time
  next()
})

ArticlesSchema.pre('update', function (next) {
  this.updateTime = new Date().getTime()
  next()
})

ArticlesSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Error: Mongoose has a duplicate key.'))
  } else {
    next(error)
  }
})

ArticlesSchema.virtual('tid').get(function () {
  return this._id
})

ArticlesSchema.statics = {
  findByID (tid) {
    return this.findOne({
      _id: tid
    })
  },

  countNonDisabled (uid, fid) {
    return this.find({ uid, fid, status: 0 }).countDocuments()
  },

  getArticlesNonDisabled (uid, fid, pageNum, pageCount) {
    return this.find({ uid, fid, status: 0 })
      .skip(pageNum * pageCount).limit(pageCount)
  },

  getArticlesWithUserAndFolder (find, filter, pageNum, pageCount) {
    return this.find(find, filter)
      .skip(pageNum * pageCount)
      .limit(pageCount)
      .populate({
        path: 'uid',
        model: User,
        select: 'name avatar'
      }).populate({
        path: 'fid',
        model: Folders,
        select: 'name'
      })
  }
}

const Articles = mongoose.model('articles', ArticlesSchema)

export default Articles
