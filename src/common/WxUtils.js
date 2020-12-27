import axios from 'axios'
import config from '@/config'
import WXBizDataCrypt from './WXBizDataCrypt'
import crypto from 'crypto'
import { getValue, setValue } from '@/config/RedisConfig'
import log4js from '@/config/Log4j'
import fs from 'fs'
import path from 'path'
import del from 'del'
import { dirExists } from './Utils'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import FormData from 'form-data'
import pathExists from 'path-exists'

const logger = log4js.getLogger('error')

export const wxGetUserInfo = async (user, code) => {
  const obj = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${config.AppID}&secret=${config.AppSecret}&js_code=${code}&grant_type=authorization_code`)
  if (obj.status === 200 && obj.data.session_key) {
    // 说明微信API请求成功，返回用户session_key
    const sessionKey = obj.data.session_key
    // setValue(obj.data.openId, sessionKey)
    const { rawData, signature, encryptedData, iv } = user
    const sha1 = crypto.createHash('sha1')
    sha1.update(rawData)
    sha1.update(sessionKey)
    if (sha1.digest('hex') !== signature) {
      return Promise.reject(new Error({
        code: 500,
        msg: '签名校验失败，请检查 '
      }))
    }
    const pc = new WXBizDataCrypt(config.AppID, sessionKey)
    return { ...pc.decryptData(encryptedData, iv), errcode: 0 }
  } else {
    return obj.data
  }
}

export const wxGetAccessToken = async (flag = false) => {
  // https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
  let accessToken = await getValue('accessToken')
  if (!accessToken || flag) {
    try {
      const result = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.AppID}&secret=${config.AppSecret}`)
      if (result.status === 200) {
        // 说明请求成功
        await setValue('accessToken', result.data.access_token, result.data.expires_in)
        accessToken = result.data.access_token
        // {"errcode":40013,"errmsg":"invalid appid"}
        if (result.data.errcode && result.data.errmsg) {
          logger.error(`Wx-GetAccessToken Error: ${result.data.errcode} - ${result.data.errmsg}`)
        }
      }
    } catch (error) {
      logger.error(`GetAccessToken Error: ${error.message}`)
    }
  }
  return accessToken
}

export const wxSendMessage = async (options) => {
  // POST https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=ACCESS_TOKEN
  const accessToken = await wxGetAccessToken()
  try {
    const result = await axios.post(`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`, { ...options })
    return result
  } catch (error) {
    logger.error(`wxSendMessage Error: ${error.message}`)
  }
}

// 内容安全
export const wxMsgCheck = async (content) => {
  // POST https://api.weixin.qq.com/wxa/msg_sec_check?access_token=ACCESS_TOKEN
  const accessToken = await wxGetAccessToken()
  try {
    const result = await axios.post(`https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${accessToken}`, { content })
    if (result.status === 200) {
      console.log('wxMsgCheck -> result.data', result.data)
      return result.data
    } else {
      logger.error(`wxMsgCheck Error: ${result.statis}`)
    }
  } catch (error) {
    logger.error(`wxMsgCheck Error: ${error.message}`)
  }
}

export const getHeaders = (form) => {
  return new Promise((resolve, reject) => {
    form.getLength((err, length) => {
      if (err) {
        reject(err)
      }
      const headers = Object.assign(
        { 'Content-Length': length },
        form.getHeaders()
      )
      resolve(headers)
    })
  })
}

// 图片内容安全
export const wxImgCheck = async (file) => {
  // POST https://api.weixin.qq.com/wxa/img_sec_check?access_token=ACCESS_TOKEN
  const accessToken = await wxGetAccessToken()
  let newPath = file.path
  const tmpPath = path.resolve('./tmp')
  try {
    // 1.准备图片的form-data
    // 2.处理图片 - 要检测的图片文件，格式支持PNG、JPEG、JPG、GIF，图片尺寸不超过 750px x 1334px
    const img = sharp(file.path)
    const meta = await img.metadata()
    if (meta.width > 750 || meta.height > 1334) {
      await dirExists(tmpPath)
      newPath = path.join(tmpPath, uuidv4() + '.png')
      await img.resize(750, 1334, {
        fit: 'inside'
      }).toFile(newPath)
    }
    const stream = fs.createReadStream(newPath)
    const form = new FormData()
    form.append('media', stream)
    const headers = await getHeaders(form)
    const result = await axios.post(`https://api.weixin.qq.com/wxa/img_sec_check?access_token=${accessToken}`, form, { headers })
    const stats = await pathExists(newPath)
    if (stats) {
      await del([tmpPath + path.extname(newPath)], { force: true })
    }
    if (result.status === 200) {
      if (result.data.errcode !== 0) {
        await wxGetAccessToken(true)
        await wxImgCheck(file)
        return
      }
      return result.data
    } else {
      logger.error(`wxMsgCheck Error: ${result.statis}`)
    }
  } catch (error) {
    const stats = await pathExists(newPath)
    if (stats) {
      await del([tmpPath + path.extname(newPath)], { force: true })
    }
    logger.error(`wxMsgCheck Error: ${error.message}`)
  }
}
