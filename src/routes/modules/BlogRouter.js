import Router from 'koa-router'
import ArticleController from '@/api/ArticleController'

import config from '@/config'
import userController from '@/api/UserController'
import FolderController from '@/api/FolderController'
import LinkController from '@/api/LinkController'

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

// 文章点赞
router.post('/like', ArticleController.likeArticle)

// 获取友链列表
router.post('/links', LinkController.getBlogLinks)

/**
 *  TODO
 *  1、评论接口
 */

export default router
