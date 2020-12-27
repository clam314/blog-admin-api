import send from '@/config/MailConfig'
import bcrypt from 'bcrypt'
import moment from 'dayjs'
import jsonwebtoken from 'jsonwebtoken'
import config from '@/config'
import { checkCode, generateToken } from '@/common/Utils'
import User from '@/model/User'
import SignRecord from '../model/SignRecord'
import { getValue, setValue } from '@/config/RedisConfig'
import { v4 as uuidv4 } from 'uuid'
class LoginController {
  // 用户登录
  async login (ctx) {
    // 接收用户的数据
    // 返回token
    const { body } = ctx.request
    console.log('login', body)
    let result = true
    if (result) {
      // 验证用户账号密码是否正确
      let checkUserPasswd = false
      const user = await User.findOne({ username: body.username })
      console.log('user', user)
      if (user === null) {
        ctx.body = {
          code: 404,
          msg: '用户名或者密码错误'
        }
        return
      }
      if (await bcrypt.compare(body.password, user.password)) {
        checkUserPasswd = true
      }
      // mongoDB查库
      if (checkUserPasswd) {
        // 验证通过，返回Token数据
        const userObj = user.toJSON()
        const arr = ['password', 'username']
        arr.map((item) => {
          return delete userObj[item]
        })
        ctx.body = {
          code: 200,
          data: userObj,
          token: generateToken({ _id: user._id }, '60m'),
          refreshToken: generateToken({ _id: user._id }, '7d')
        }
      } else {
        // 用户名 密码验证失败，返回提示
        ctx.body = {
          code: 404,
          msg: '用户名或者密码错误'
        }
      }
    } else {
      // 图片验证码校验失败
      ctx.body = {
        code: 401,
        msg: '图片验证码不正确,请检查！'
      }
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
    const { body } = ctx.request
    body.password = await bcrypt.hash(body.password, 5)
    console.log('reset pwd', body.password)
    const sid = body.sid
    const code = body.code
    let msg = {}
    // 验证图片验证码的时效性、正确性
    const result = await checkCode(sid, code)
    if (!body.key) {
      ctx.body = {
        code: 500,
        msg: '请求参数异常，请重新获取链接'
      }
      return
    }
    if (!result) {
      msg.code = ['验证码已经失效，请重新获取！']
      ctx.body = {
        code: 500,
        msg: msg
      }
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
      ctx.body = {
        code: 200,
        msg: '更新用户密码成功！'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '链接已经失效'
      }
    }
  }
}

export default new LoginController()
