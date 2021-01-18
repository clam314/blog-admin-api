import Router from 'koa-router'
import ArticleController from '@/api/ArticleController'

import config from '@/config'
import userController from '@/api/UserController'
import FolderController from '@/api/FolderController'

const router = new Router()

router.prefix(config.getUrlPrefixStr('/blog/'))

// 用户信息
router.post('/user', userController.userBasicInfo)

// 获取文章分类
router.post('/categories', FolderController.getBlogCategories)

// 文章列表
router.post('/list', ArticleController.getBlogArticles)

// 文章详情
router.post('/details', ArticleController.getArticleDetail)

/**
 *  TODO
 *  1、点赞接口
 *  2、评论接口
 */

export default router
