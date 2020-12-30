import bcrypt from 'bcryptjs'
import { checkCode, generateToken } from '@/common/Utils'
import Apps from '@/model/App'
import User from '@/model/User'
import { getValue } from '@/config/RedisConfig'
import { builder, getRequestId } from '@/common/HttpHelper'

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
    const { header: head, body } = ctx.request
    console.log('login head:', head)
    console.log('login body:', body)

    const requestId = getRequestId(ctx)

    // 验证用户账号密码是否正确
    let checkUserPasswd = false
    const user = await User.findOne({ username: body.username })
    console.log('user', user)
    if (user === null) {
      ctx.body = builder({}, requestId, '用户名或者密码错误', 404)
      return
    }
    if (await bcrypt.compare(body.password, user.password)) {
      checkUserPasswd = true
    }
    // 生成token
    if (checkUserPasswd) {
      ctx.body = builder({
        token: generateToken({ _id: user._id }, '7d'),
        refreshToken: generateToken({ _id: user._id }, '7d')
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
    const { head, body } = ctx.request.body
    console.log('reset head:', head)
    console.log('reset body:', body)
    const requestId = head.requestId

    body.password = await bcrypt.hash(body.password, 5)
    console.log('reset pwd', body.password)
    const sid = body.sid
    const code = body.code
    let msg = {}
    // 验证图片验证码的时效性、正确性
    const result = await checkCode(sid, code)
    if (!body.key) {
      ctx.body = builder({}, requestId, '请求参数异常，请重新获取链接', 500)
      return
    }
    if (!result) {
      ctx.body = builder({}, requestId, '验证码已经失效，请重新获取！', 500)
      return
    }
    const token = await getValue(body.key)
    if (token) {
      body.password = await bcrypt.hash(body.password, 5)
      await User.updateOne(
        { _id: ctx._id },
        {
          password: body.password
        }
      )
      ctx.body = builder({}, requestId, '更新用户密码成功！')
    } else {
      ctx.body = builder({}, requestId, '链接已经失效！', 500)
    }
  }
}

export default new LoginController()
