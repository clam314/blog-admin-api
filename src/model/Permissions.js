import mongoose from '@/config/DBHelpler'

const Schema = mongoose.Schema

const PermissionsSchema = new Schema({
  _id: { type: Schema.Types.ObjectId },
  roleId: { type: String, default: '' },
  permissionId: { type: String, default: '' },
  permissionName: { type: String, default: '' },
  actions: { type: String, default: '' },
  actionEntitySet: { type: String, default: '' },
  actionList: String,
  dataAccess: String
})

const Permissions = mongoose.model('permissions', PermissionsSchema)

export default Permissions
