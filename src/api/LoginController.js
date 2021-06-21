import bcrypt from 'bcryptjs'
import { generateToken } from '@/common/Utils'
import Apps from '@/model/App'
import User from '@/model/User'
import { builder, getRequestId } from '@/common/HttpHelper'
import config from '@/config'
import crypto from 'crypto'

class LoginController {
  // 初始化数据获取
  async initial (ctx) {
    const { body } = ctx.request
    const requestId = getRequestId(ctx)
    console.log('login body:', body)
    const app = await Apps.findOne({ appKey: body.appKey })
    console.log('app', app)
    if (!app || app.status) {
      ctx.body = builder({}, requestId, '不存在的AppKey或无效的AppKey!', 404)
    } else {
      ctx.body = builder({ appSecret: app.appSecret }, requestId)
    }
  }

  // 用户登录
  async login (ctx) {
    // 接收用户的数据
    // 返回token
    const { body } = ctx.request
    const requestId = getRequestId(ctx)

    // 验证用户账号密码是否正确
    let checkUserPasswd = true
    const user = await User.findOne({ username: body.username })
    if (user === null || !body.password) {
      ctx.status = 404
      return
    }
    const pw = crypto.privateDecrypt({ key: config.PRIVATE_KEY, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(body.password, 'base64'))
    if (!pw) {
      ctx.status = 404
      return
    }

    if (await bcrypt.compare(pw.toString('utf-8'), user.password)) {
      checkUserPasswd = true
    }
    // 生成token
    if (checkUserPasswd) {
      // 更新用户登录的ip和时间
      const clientIp = body['x-real-ip'] || 'Not Find'
      const loginTime = new Date().getTime()
      user.lastLoginIp = clientIp
      user.lastLoginTime = loginTime
      await user.save()
      ctx.body = builder({
        token: generateToken({ _id: user._id }, '7d')
      }, requestId)
    } else {
      // 用户名 密码验证失败，返回提示
      ctx.body = builder({}, requestId, '用户名或者密码错误', 404)
    }
  }

  // refreshToken
  async refresh (ctx) {
    ctx.body = {
      code: 200,
      token: generateToken({ _id: ctx._id }),
      msg: '获取token成功'
    }
  }

  // 密码重置
  async reset (ctx) {
  }

  async logout (ctx) {
    ctx.body = builder({}, getRequestId(ctx), '[测试接口] 注销成功！')
  }
}

export default new LoginController()
