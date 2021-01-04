import { getJWTPayload } from '@/common/Utils'
import Articles from '@/model/Articles'
import { builder, getRequestId } from '@/common/HttpHelper'
import Folders from '@/model/Folders'

class ArticleController {
  async getList (ctx) {
    const { body } = ctx.request
    const requestId = getRequestId(ctx)
    const pageNum = body.pageNum ? parseInt(body.pageNum) : 0
    const pageCount = body.pageCount ? parseInt(body.pageCount) : 10
    const fid = body.fid
    const tid = body.tid
    const obj = await getJWTPayload(ctx.header.token)

    if (!fid || fid === '') {
      ctx.body = builder({}, requestId, '请求参数有误！', '400')
      return
    }

    const list = await Articles.getArticlesNonDisabled(obj._id, fid, pageNum, pageCount)
    const total = await Articles.countNonDisabled(obj._id, fid)
    const result = {
      pageNum,
      pageCount,
      total,
      list
    }
    result.list = list || []
    ctx.body = builder(result, getRequestId(ctx))
  }

  async addArticle (ctx) {
    const { body } = ctx.request
    const requestId = getRequestId(ctx)
    const newTitle = body.title
    const newDesc = body.description || ''
    const fid = body.fid

    if (!newTitle || newTitle === '') {
      ctx.body = builder({}, requestId, '请输入文档名称', '400')
      return
    }

    if (!fid || fid === '') {
      ctx.body = builder({}, requestId, '请求参数有误！', '400')
      return
    }

    const folder = await Folders.findOne({ _id: fid })
    if (!folder) {
      ctx.body = builder({}, requestId, '请求参数有误', '400')
      return
    }

    const obj = await getJWTPayload(ctx.header.token)
    const list = await Articles.findOne({ fid: fid, title: newTitle, status: 0 })
    if (list) {
      ctx.body = builder({}, requestId, '该文档已经存在', '400')
      return
    }

    const newArticle = new Articles()
    newArticle.uid = obj._id
    newArticle.fid = fid
    newArticle.description = newDesc
    newArticle.title = newTitle
    const article = await newArticle.save()
    if (article._id) {
      ctx.body = builder(article, requestId)
    } else {
      ctx.body = builder({}, requestId, '创建失败！', 500)
    }
  }

  async updateArticleInfo (ctx) {

  }

  async updateContent (ctx) {

  }

  async publish (ctx) {

  }

  async deleteArticle (ctx) {

  }
}

export default new ArticleController()
