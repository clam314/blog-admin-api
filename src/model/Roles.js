import mongoose from '@/config/DBHelpler'

const Schema = mongoose.Schema

const RolesSchema = new Schema({
  _id: { type: Schema.Types.ObjectId },
  id: { type: String },
  name: { type: String },
  describe: { type: String },
  status: { type: Number, default: 0 },
  creatorId: { type: String, default: '' },
  createTime: { type: String, default: '' },
  deleted: { type: Number, default: 0 },
  permissions: [{ type: Schema.Types.ObjectId, ref: 'permissions' }]
})

const Roles = mongoose.model('roles', RolesSchema)

export default Roles
