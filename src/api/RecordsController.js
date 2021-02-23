import { builder, getRequestId } from '@/common/HttpHelper'
const typeList = ['IP', 'UV', 'PV']
class RecordsController {
  // 获取独立访客数UV
  async getUniqueVisitor (ctx) {
    const { type } = ctx.request.body
    const requestId = getRequestId(ctx)
    if (!typeList.includes(type)) {
      ctx.body = builder({}, requestId, '参数不合法', '400')
    }
  }

  // 获取页面浏览量
  async getPageView (ctx) {
    const { type } = ctx.request.body
    const requestId = getRequestId(ctx)
    if (!typeList.includes(type)) {
      ctx.body = builder({}, requestId, '参数不合法', '400')
    }
  }

  // 获取浏览的IP数
  async getClientIp (ctx) {
    const { type } = ctx.request.body
    const requestId = getRequestId(ctx)
    if (!typeList.includes(type)) {
      ctx.body = builder({}, requestId, '参数不合法', '400')
    }
  }
}

export default new RecordsController()
