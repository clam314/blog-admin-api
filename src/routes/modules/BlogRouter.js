import Router from 'koa-router'
import ArticleController from '@/api/ArticleController'

import config from '@/config'
import userController from '@/api/UserController'

const router = new Router()

router.prefix(config.getUrlPrefixStr('/blog/'))

// 用户信息
router.get('/user', userController.userBasicInfo)

// 文章列表
router.post('/list', ArticleController.getList)

// 文章列表
router.post('/details', ArticleController.getList)

/**
 *  TODO
 *  1、点赞接口
 *  2、评论接口
 */

export default router
