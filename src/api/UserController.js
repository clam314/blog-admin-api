import { getJWTPayload } from '@/common/Utils'
import User from '@/model/User'
import bcrypt from 'bcryptjs'
import { builder, getRequestId } from '@/common/HttpHelper'
import { notNullObj, validateEmail, validateStrLength } from '@/common/validate'
import config from '@/config/index'
import { promises as fsp, createReadStream, createWriteStream } from 'fs'
import moment from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { decode } from 'js-base64'

class UserController {
  // 用户信息
  async userInfo (ctx) {
    // 取用户的ID
    console.log('user info:', ctx.header)
    const obj = await getJWTPayload(ctx.header.token)
    const user = await User.findRoleById(obj._id)
    if (!user) {
      ctx.body = builder({}, getRequestId(ctx), '用户不存在', '404')
    } else {
      ctx.body = builder(user, getRequestId(ctx))
    }
  }

  // 用户基本信息
  async userBasicInfo (ctx) {
    // 取用户的ID
    console.log('userBasicInfo:', ctx)
    const { body } = ctx.request
    const uid = body.bid
    if (!uid) {
      ctx.body = builder({}, getRequestId(ctx), '参数不合法！', '400')
      return
    }
    const user = await User.findOne({
      _id: decode(uid)
    }, {
      _id: 0,
      name: 1,
      avatar: 1,
      email: 1,
      introduction: 1,
      tags: 1
    })

    if (!user) {
      ctx.body = builder({}, getRequestId(ctx), '用户不存在', '404')
    } else {
      ctx.body = builder(user, getRequestId(ctx))
    }
  }

  // 更新用户基本信息接口
  async updateUserInfo (ctx) {
    const { body } = ctx.request
    const requestId = getRequestId(ctx)
    const nickName = body.nickName
    const introduction = body.introduction
    const email = body.email

    const newInfo = {}
    if (email) {
      // 判断邮箱是否已经被绑定
      const user = await User.findOne({ email: email })
      if (user) {
        ctx.body = builder({}, requestId, '邮箱已经注册', '400')
        return
      }
      if (validateEmail(email)) {
        newInfo.email = email
      }
    }
    if (validateStrLength(nickName, 1, 10)) {
      newInfo.name = nickName
    }
    if (validateStrLength(introduction, 1, 80)) {
      newInfo.introduction = introduction
    }

    if (notNullObj(newInfo)) {
      const obj = await getJWTPayload(ctx.header.token)
      const user = await User.updateOne({ _id: obj._id }, newInfo)
      if (user.ok) {
        ctx.body = builder({}, requestId)
      } else {
        ctx.body = builder({}, requestId, '创建失败！', 500)
      }
      return
    }
    ctx.body = builder({}, requestId, '参数不合法！', 400)
  }

  // 更新用户标签
  async updateUserTags (ctx) {
    const { body } = ctx.request
    const requestId = getRequestId(ctx)
    const tag = body.tag
    const isDelete = body.isDelete

    if (!validateStrLength(tag, 1) || typeof isDelete === 'undefined') {
      ctx.body = builder({}, requestId, '参数不合法！', 400)
      return
    }
    const obj = await getJWTPayload(ctx.header.token)
    const user = await User.findByID(obj._id)
    if (user) {
      let updateTags = false
      if (isDelete) {
        user.tags = user.tags.filter(t => t !== tag)
        updateTags = true
      } else {
        if (!user.tags.includes(tag)) {
          user.tags.push(tag)
          updateTags = true
        }
      }
      if (updateTags) {
        const updateResult = await user.save()
        console.log('update:', updateResult)
      }
      ctx.body = builder({ tag, isDelete }, requestId)
      return
    }
    ctx.body = builder({}, requestId, '找不到该用户！', 400)
  }

  // 上传头像
  async uploadAvatar (ctx) {
    const requestId = getRequestId(ctx)
    const file = ctx.request.files.file

    const obj = await getJWTPayload(ctx.header.token)
    const user = await User.findByID(obj._id)
    if (!user) {
      ctx.body = builder({}, requestId, '参数异常,上传失败！', 400)
      return
    }

    try {
      const ext = file.name.split('.').pop().toLowerCase()
      const folder = 'avatar'
      const dir = `${config.uploadPath}/${folder}`
      // 判断路径是否存在，不存在则创建
      await fsp.mkdir(dir, { recursive: true })
      const picName = uuidv4().replace(/-/g, '')
      const destPath = `${dir}/${picName}.${ext}`
      const readerStream = createReadStream(file.path)
      const upStream = createWriteStream(destPath)
      readerStream.pipe(upStream)
      const url = `${config.baseUrl}/${config.serverPath}/${folder}/${picName}.${ext}`
      user.avatar = url
      const updateResult = await user.save()
      console.log('updateResult:', updateResult)
      if (updateResult) {
        ctx.body = builder({ url }, requestId, '上传成功')
      } else {
        ctx.body = builder({}, requestId, '服务器异常，更新用户头像失败！', 500)
      }
    } catch (e) {
      console.error(e)
      ctx.body = builder({}, requestId, '服务器异常，上传失败！', 500)
    }
  }

  // 修改密码接口
  async changePasswd (ctx) {
    const { body } = ctx.request
    const requestId = getRequestId(ctx)
    const obj = await getJWTPayload(ctx.header.authorization)
    const user = await User.findOne({ _id: obj._id })
    if (await bcrypt.compare(body.oldpwd, user.password)) {
      const newpasswd = await bcrypt.hash(body.newpwd, 5)
      await User.updateOne({ _id: obj._id }, { $set: { password: newpasswd } })
      ctx.body = builder({}, requestId, '更新密码成功！')
    } else {
      ctx.body = builder({}, requestId, '更新密码错误，请检查！', 500)
    }
  }
}

export default new UserController()
