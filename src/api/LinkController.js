import { builder, getRequestId } from '@/common/HttpHelper'
import Links from '@/model/Links'

class LinkController {
  async getBlogLinks (ctx) {
    const requestId = getRequestId(ctx)
    const { bid } = ctx.request.body
    if (!bid) {
      ctx.body = builder({}, requestId, '请求参数有误！', '400')
    }
    const list = await Links.find()
    ctx.body = builder(list || {}, requestId)
  }
}

export default new LinkController()
