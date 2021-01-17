import config from '../config/index'
import jwt from 'jsonwebtoken'
import md5 from 'js-md5'
import Apps from '@/model/App'

const getJWTPayload = async token => {
  try {
    return await jwt.verify(token, config.JWT_SECRET)
  } catch (error) {
    throw new Error(error)
  }
}

const checkToken = async (token) => {
  try {
    const payload = await jwt.verify(token, config.JWT_SECRET)
    let { exp: timeout } = payload
    let data = new Date().getTime() / 1000
    return data <= timeout
  } catch (error) {
    return false
  }
}

const checkSign = async (header) => {
  if (!header || !header.sign) {
    return false
  } else {
    const checkHead = {
      appKey: header.appkey,
      token: header.token,
      requestId: header.requestid,
      uuid: header.uuid
    }
    let app = await Apps.findOne({ appKey: header.appkey })
    if (!app) {
      return false
    }
    let md5string = ''
    Object.keys(checkHead).forEach((key) => {
      if (checkHead[key] != null && typeof checkHead[key] === 'object') {
        md5string = md5string + JSON.stringify(checkHead[key])
      } else if (checkHead[key] != null) {
        md5string = md5string + checkHead[key]
      }
    })
    return header.sign === md5(md5string + app.appSecret)
  }
}

// 生成 token 返回给客户端
const generateToken = (payload, expire = '1h') => {
  if (payload) {
    return jwt.sign({
      ...payload
    }, config.JWT_SECRET, { expiresIn: expire })
  } else {
    throw new Error('生成token失败！')
  }
}

export {
  checkToken,
  checkSign,
  getJWTPayload,
  generateToken
}
