import Router from 'koa-router'
import FolderController from '@/api/FolderController'

import config from '@/config'

const router = new Router()

router.prefix(config.getUrlPrefixStr('/folder/'))

// 文件夹列表
router.get('/list', FolderController.getList)

// 添加文件
router.get('/add', FolderController.addFolder)

// 更新文件夹的基本信息
router.post('/update', FolderController.updateFolderInfo)

// 删除文件夹
router.post('/delete', FolderController.deleteFolder)

export default router
