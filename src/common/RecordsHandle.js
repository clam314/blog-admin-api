import Records from '@/model/Record'

function getCookie (name, cookie) {
  if (!cookie) {
    return ''
  }
  const arrCookie = cookie.split('; ')// 分割
  // 遍历匹配
  for (let i = 0; i < arrCookie.length; i++) {
    const arr = arrCookie[i].split('=')
    if (arr[0] === name) {
      return arr[1]
    }
  }
  return ''
}

const getRecord = (ctx) => {
  const { header } = ctx.request
  const uuid = getCookie('uuid', ctx.cookie) || ctx.uuid || ''
  const clientIp = ''
  return {
    code: ctx.status,
    url: ctx.url,
    host: header.host,
    clientIp,
    uuid,
    requestId: header.requestid || '',
    userAgent: header['user-agent'] || ''
  }
}

export default async (ctx, next) => {
  try {
    await next()
  } catch (e) {

  }
}
