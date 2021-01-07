import mongoose from '@/config/DBHelpler'
import Roles from '@/model/Roles'
import Permissions from '@/model/Permissions'

const Schema = mongoose.Schema

const UserSchema = new Schema({
  _id: { type: Schema.Types.ObjectId },
  name: { type: String },
  username: { type: String, index: { unique: true }, sparse: true },
  password: { type: String },
  avatar: { type: String, default: '' },
  status: { type: Number, default: 0 },
  telephone: { type: String, default: '' },
  lastLoginIp: { type: String, default: '' },
  lastLoginTime: { type: String, default: '' },
  creatorId: { type: String, default: '' },
  createTime: { type: String, default: '' },
  updateTime: { type: String, default: '' },
  deleted: { type: Number, default: 0 },
  roleId: { type: String, default: 'user' },
  lang: { type: String, default: 'zh-CN' },
  role: { type: Schema.Types.ObjectId, ref: 'roles' },
  email: { type: String, default: '' },
  introduction: { type: String, default: '' },
  tags: { type: [String], default: [] }
})

UserSchema.pre('save', function (next) {
  const time = new Date().getTime()
  if (!this.createTime) {
    this.createTime = time
  }
  this.updateTime = time
  next()
})

UserSchema.pre('update', function (next) {
  this.updateTime = new Date().getTime()
  next()
})

UserSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Error: Mongoose has a duplicate key.'))
  } else {
    next(error)
  }
})

UserSchema.statics = {
  findByID (id) {
    return this.findOne({
      _id: id
    }, {
      password: 0
    })
  },

  findRoleById (uid) {
    return this.findOne({ _id: uid }, { password: 0 })
      .populate({
        path: 'role',
        model: Roles,
        populate: {
          path: 'permissions',
          model: Permissions
        }
      })
  },

  queryCount: function (options) {
    return this.find(options).countDocuments()
  },

  updateMobile: function (uid, phone) {
    return this.updateOne({
      _id: uid
    }, {
      mobile: phone
    })
  },

  updateEmail: function (uid, email) {
    return this.updateOne({
      _id: uid
    }, {
      username: email
    })
  }
}

const User = mongoose.model('users', UserSchema)

export default User
