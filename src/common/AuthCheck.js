/**
 * 检查头部是否带有appkey以及是否不需要校验jwt的目录
 *
 */
import { checkToken, checkSign } from '@/common/Utils'
import config from '@/config/index'

let pathsRegEpx = null

export const unless = (regEpx) => {
  pathsRegEpx = regEpx.map(item => {
    return new RegExp('^' + config.baseUrlPrefix + item)
  })
}

export default async (ctx, next) => {
  if (pathsRegEpx) {
    for (const re of pathsRegEpx) {
      if (re.test(ctx.path)) {
        await next()
        return
      }
    }
  }

  const token = ctx.header.token
  if (!token || !checkSign(ctx.header)) {
    ctx.body = {
      code: 406,
      msg: '没有权限！'
    }
    return
  }
  if (!checkToken(token)) {
    ctx.body = {
      code: 401,
      msg: 'token过期，请重新登录！'
    }
    return
  }
  await next()
}
