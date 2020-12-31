import Router from 'koa-router'
import loginController from '@/api/LoginController'
import config from '@/config/index'

const router = new Router()

router.prefix(config.getUrlPrefixStr('/login/'))

// 获取初始化数据
router.post('/initial', loginController.initial)

// 登录接口
router.post('/login', loginController.login)

// 退出登录接口
router.post('/logout', loginController.logout)

// 重置密码
router.post('/reset', loginController.reset)

export default router
