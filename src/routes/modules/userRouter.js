import Router from 'koa-router'
import userController from '@/api/UserController'
import config from '@/config'

const router = new Router()

router.prefix(config.getUrlPrefixStr('/user/'))

// 用户信息
router.get('/info', userController.userInfo)

// 更新用户的基本信息
router.post('/update', userController.updateUserInfo)

// 更新用户的标签
router.post('/updateTags', userController.updateUserTags)

// 上传用户头像
router.post('/avatar', userController.uploadAvatar)

// // 修改密码
// router.post('/changePassword', userController.changePasswd)

export default router
