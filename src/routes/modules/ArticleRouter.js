import Router from 'koa-router'
import ArticleController from '@/api/ArticleController'

import config from '@/config'

const router = new Router()

router.prefix(config.getUrlPrefixStr('/article/'))

// 文章列表
router.post('/list', ArticleController.getList)

// 添加文章
router.post('/add', ArticleController.addArticle)

// 上传文章相关图片
router.post('/img', ArticleController.uploadArticleImage)

// 更新文章的信息
router.post('/updateInfo', ArticleController.updateArticleInfo)

// 更新文章的内容
router.post('/updateContent', ArticleController.updateContent)

// 发布文章
router.post('/publish', ArticleController.publish)

// 删除文章
router.post('/delete', ArticleController.deleteArticle)

export default router
