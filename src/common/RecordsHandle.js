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

const getForwardedIp = (ctx) => {
  const forward = ctx.header['x-forwarded-for']
  if (forward) {
    if (forward.indexOf(',') !== -1) {
      return forward.split(',')[0]
    } else {
      return forward
    }
  } else {
    return ''
  }
}

const getRecord = (ctx) => {
  const { header } = ctx.request
  const uuid = getCookie('uuid', ctx.cookie) || ctx.uuid || ''
  const forwardedIp = getForwardedIp(ctx)
  const clientIp = header['x-real-ip'] || forwardedIp
  const end = ctx.url.search('/blog') > -1 ? 'blog' : 'admin'
  return {
    url: ctx.url,
    host: header.host,
    end,
    clientIp,
    uuid,
    requestId: header.requestid || '',
    userAgent: header['user-agent'] || '',
    xForwardedHost: header['x-forwarded-host'] || '',
    xForwardedFor: getForwardedIp(ctx),
    xRealIp: header['x-real-ip'] || ''
  }
}

export default async (ctx, next) => {
  let record = null
  try {
    await next()
    if (ctx.status === 200 && ctx.response.header) {
      record = getRecord(ctx)
      record.code = ctx.response.header.respCode || 200
    } else {
      record = getRecord(ctx)
      record.code = ctx.status
    }
  } catch (e) {
    record = getRecord(ctx)
    record.code = ctx.status
  }
  await new Records(record).save()
}
