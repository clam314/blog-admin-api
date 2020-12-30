export const getPublicHead = (requestId, message, code) => {
  return {
    requestId,
    respCode: code,
    respMsg: message,
    timestamp: new Date().getTime()
  }
}

export const builder = (result, requestId = '', message = 'OK', code = 200) => {
  const body = {
    result,
    head: getPublicHead(requestId, message, code)
  }
  return body
}

export const getRequestId = (ctx) => {
  return ctx.header.requestid ? ctx.header.requestid : ''
}
