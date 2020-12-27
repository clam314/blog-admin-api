import Router from 'koa-router'
import loginController from '@/api/LoginController'
import config from '@/config/index'

const router = new Router()

router.prefix(config.getUrlPrefixStr('/login/'))

// 登录接口
router.post('/login', loginController.login)

// 重置密码
router.post('/reset', loginController.reset)

export default router
