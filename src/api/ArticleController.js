import { getJWTPayload } from '@/common/Utils'
import Articles from '@/model/Articles'
import { builder, getRequestId } from '@/common/HttpHelper'
import Folders from '@/model/Folders'
import moment from 'dayjs'
import config from '@/config'
import { createReadStream, createWriteStream, promises as fsp } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { notNullObj, validateStrLength } from '@/common/validate'
import { decode } from 'js-base64'
import User from '@/model/User'

class ArticleController {
  async getList (ctx) {
    const { body } = ctx.request
    const requestId = getRequestId(ctx)
    const pageNum = body.pageNum ? parseInt(body.pageNum) : 0
    const pageCount = body.pageCount ? parseInt(body.pageCount) : 10
    const fid = body.fid
    // const tid = body.tid
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
    const requestId = getRequestId(ctx)
    const { tid, fid, newFid, published, status, description } = ctx.request.body
    const article = await Articles.findOne({ _id: tid, fid: fid })
    if (!article) {
      ctx.body = builder({}, requestId, '查询无此文档！', 400)
      return
    }
    let update = false
    if (newFid && newFid !== fid) {
      const folder = await Folders.findOne({ _id: newFid })
      if (folder) {
        article.fid = folder._id
        update = true
      }
    }
    if (/^[0-1]$/.test(published)) {
      article.published = published
      update = true
    }
    if (Array.isArray(status) && status.length > 0) {
      ['private', 'isTop', 'converse'].forEach(s => {
        article[s] = Number(status.includes(s))
      })
      update = true
    }
    if (validateStrLength(description, 1, 200)) {
      article.description = description
      update = true
    }
    if (update) {
      const updateResult = await article.save()
      ctx.body = builder({ article: updateResult }, requestId)
      return
    }
    ctx.body = builder({}, requestId, '参数不合法！', 400)
  }

  async updateArticleTags (ctx) {
    const requestId = getRequestId(ctx)
    const { tid, tag, isDelete } = ctx.request.body

    if (!validateStrLength(tag, 1) || typeof isDelete === 'undefined') {
      ctx.body = builder({}, requestId, '参数不合法！', 400)
      return
    }
    const article = await Articles.findByID(tid)
    if (article) {
      let update = false
      if (isDelete) {
        article.tags = article.tags.filter(t => t !== tag)
        update = true
      } else {
        if (!article.tags.includes(tag)) {
          article.tags.push(tag)
          update = true
        }
      }
      if (update) {
        await article.save()
      }
      ctx.body = builder({ tag, isDelete }, requestId)
    } else {
      ctx.body = builder({}, requestId, '参数不合法，保存失败！', 400)
    }
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
            const articleNew = await Articles.findByID(tid)
            ctx.body = builder({ article: articleNew }, requestId)
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

  async getBlogArticles (ctx) {
    const { body } = ctx.request
    const requestId = getRequestId(ctx)
    const bid = body.bid
    const fid = body.fid
    const pageNum = body.pageNum ? parseInt(body.pageNum) : 0
    const pageCount = body.pageCount ? parseInt(body.pageCount) : 10

    if (!bid) {
      ctx.body = builder({}, requestId, '请求参数有误！', '400')
      return
    }
    const find = { uid: decode(bid), published: 1, private: 0, status: 0 }
    if (fid) {
      find.fid = fid
    }
    const list = await Articles.getArticlesWithUserAndFolder(find, {
      description: 1,
      des_image: 1,
      published: 1,
      reads: 1,
      like: 1,
      comments: 1,
      converse: 1,
      isTop: 1,
      sort: 1,
      tags: 1,
      title: 1,
      tid: 1,
      uid: 1,
      fid: 1
    }, pageNum, pageCount)
    const total = await Articles.find(find).countDocuments()
    const result = {
      pageNum,
      pageCount,
      total
    }
    if (list) {
      const newList = []
      list.forEach(item => {
        const nItem = item.toJSON()
        delete nItem.uid._id
        nItem.user = nItem.uid
        nItem.category = nItem.fid.name
        delete nItem.uid
        delete nItem.fid
        newList.push(nItem)
      })
      result.list = newList
    } else {
      result.list = []
    }
    ctx.body = builder(result, getRequestId(ctx))
  }

  async getArticleDetail (ctx) {
    const requestId = getRequestId(ctx)
    const { bid, tid } = ctx.request.body

    if (!tid || !bid) {
      ctx.body = builder({}, getRequestId(ctx), '参数不合法！', '400')
      return
    }
    const find = { _id: tid, uid: decode(bid), published: 1, private: 0, status: 0 }

    const article = await Articles.findOne(find, {
      _id: 1,
      description: 1,
      des_image: 1,
      reads: 1,
      like: 1,
      comments: 1,
      converse: 1,
      isTop: 1,
      sort: 1,
      tags: 1,
      publishedTime: 1,
      uid: 1,
      fid: 1,
      title: 1,
      contentHtml: 1
    })

    if (!article) {
      ctx.body = builder({}, getRequestId(ctx), '文章不存在！', '404')
      return
    }
    const folder = await Folders.findById(article.fid)
    const user = await User.findByID(article.uid)
    delete article.uid
    delete article.fid
    article.category = folder.name
    article.userInfo = {
      name: user.name,
      avatar: user.avatar
    }
    ctx.body = builder(article, requestId)
  }
}

export default new ArticleController()
