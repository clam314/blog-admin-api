import Folders from '@/model/Folders'
import { getJWTPayload } from '@/common/Utils'
import { builder, getRequestId } from '@/common/HttpHelper'

class FolderController {
  async getList (ctx) {
    const obj = await getJWTPayload(ctx.header.token)
    const list = await Folders.find({ uid: obj._id, status: 0 }).sort({ name: 1 })
    if (!list) {
      ctx.body = builder([], getRequestId(ctx))
    } else {
      ctx.body = builder(list, getRequestId(ctx))
    }
  }

  async addFolder (ctx) {
    const { body } = ctx.request
    const requestId = getRequestId(ctx)
    const newFolderName = body.name

    if (!newFolderName || newFolderName === '') {
      ctx.body = builder({}, requestId, '请输入文件夹名称', '404')
      return
    }
    const obj = await getJWTPayload(ctx.header.token)
    const list = await Folders.findOne({ uid: obj._id, name: newFolderName, status: 0 })
    if (list) {
      ctx.body = builder({}, requestId, '该文件夹已经存在', '404')
      return
    }

    const newFolder = new Folders()
    newFolder.uid = obj._id
    newFolder.name = newFolderName
    const folder = await newFolder.save()
    if (folder._id) {
      ctx.body = builder(folder, requestId)
    } else {
      ctx.body = builder({}, requestId, '创建失败！', 500)
    }
  }

  async updateFolderInfo (ctx) {

  }

  async deleteFolder (ctx) {

  }
}

export default new FolderController()
