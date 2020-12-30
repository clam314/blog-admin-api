/**
 * 检查头部是否带有appkey以及是否不需要校验jwt的目录
 *
 */
import { checkToken, checkSign, checkRedisAccountCode } from '@/common/Utils'
import config from '@/config/index'
import { builder, getRequestId } from '@/common/HttpHelper'

let pathsRegEpx = null

export const unless = (regEpx) => {
  pathsRegEpx = regEpx.map(item => {
    return new RegExp('^' + config.baseUrlPrefix + item)
  })
}

export default async (ctx, next) => {
  // 白名单path,免校验
  if (pathsRegEpx) {
    for (const re of pathsRegEpx) {
      if (re.test(ctx.path)) {
        await next()
        return
      }
    }
  }

  // token校验
  let checkUserToken = await checkToken(ctx.header.token)
  if (!checkUserToken) {
    ctx.body = builder({}, getRequestId(ctx), 'token过期,请重新登录！', '401')
    return
  }
  // sign校验
  let checkUserSign = await checkSign(ctx.header)
  if (!checkUserSign) {
    ctx.body = builder({}, getRequestId(ctx), '没有权限！', '406')
    return
  }
  await next()
}
