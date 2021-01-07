import { getJWTPayload } from '@/common/Utils'
import Articles from '@/model/Articles'
import { builder, getRequestId } from '@/common/HttpHelper'
import Folders from '@/model/Folders'
import moment from 'dayjs'
import config from '@/config'
import { createReadStream, createWriteStream, promises as fsp } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { notNullObj, validateStrLength } from '@/common/validate'

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

  async uploadArticleImage (ctx) {
    const requestId = getRequestId(ctx)
    try {
      const file = ctx.request.files.file
      const ext = file.name.split('.').pop().toLowerCase()
      const folder = moment().format('YYYYMMDD')
      const dir = `${config.uploadPath}/${folder}`
      // 判断路径是否存在，不存在则创建
      await fsp.mkdir(dir, { recursive: true })

      const picName = uuidv4().replace(/-/g, '')
      const destPath = `${dir}/${picName}.${ext}`
      const readerStream = createReadStream(file.path)
      const upStream = createWriteStream(destPath)
      readerStream.pipe(upStream)
      const url = `${ctx.origin}/${folder}/${picName}.${ext}`
      ctx.body = builder({ url }, requestId, '上传成功')
    } catch (e) {
      console.error(e)
      ctx.body = builder({}, requestId, '服务器异常，上传失败！', 500)
    }
  }

  async updateArticleInfo (ctx) {

  }

  async updateContent (ctx) {
    const requestId = getRequestId(ctx)
    const { tid, title, contentMd, contentHtml } = ctx.request.body

    const newContent = {}
    if (validateStrLength(title, 1)) {
      newContent.title = title
    }
    if (validateStrLength(contentMd, 1)) {
      newContent.content = contentMd
    }
    if (validateStrLength(contentHtml, 1)) {
      newContent.contentHtml = contentHtml
    }

    // 传入值合法
    if (notNullObj(newContent)) {
      const article = await Articles.findByID(tid)
      if (article) {
        // 值一致，无需修改数据库，否则再更新数据库
        if (article.title === title && article.content === contentMd && article.contentHtml === contentHtml) {
          ctx.body = builder({ article }, requestId)
        } else {
          const result = await Articles.updateOne({ _id: tid }, newContent)
          // 更新成功
          if (result.ok) {
            ctx.body = builder({ article }, requestId)
          } else {
            ctx.body = builder({}, requestId, '保存失败！', 500)
          }
        }
      } else {
        ctx.body = builder({}, requestId, '参数不合法，保存失败！', 400)
      }
    } else {
      ctx.body = builder({}, requestId, '参数不合法，保存失败！', 400)
    }
  }

  async publish (ctx) {

  }

  async deleteArticle (ctx) {

  }
}

export default new ArticleController()
