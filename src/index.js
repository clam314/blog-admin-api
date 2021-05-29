import Koa from 'koa'
import path from 'path'
import helmet from 'koa-helmet'
import statics from 'koa-static'
import router from './routes/routes'
import koaBody from 'koa-body'
import jsonutil from 'koa-json'
import cors from '@koa/cors'
import compose from 'koa-compose'
import compress from 'koa-compress'
import config from './config/index'
import errorHandle from './common/ErrorHandle'
import log4js from '@/config/Log4j'
import monitorLogger from '@/common/Logger'
import authCheck, { unless } from '@/common/AuthCheck'
import recordsHandle from '@/common/RecordsHandle'

const app = new Koa()

global.console.log2 = (msg, index = 1) => { // 用于控制台打印
  console.log(`===> ${index}: `, msg)
  console.log('===> typeof: ', typeof msg)
}

// 定义公共路径，不需要jwt鉴权
unless(config.publicPath)

/**
 * 使用koa-compose 集成中间件
 */
const middleware = compose([
  monitorLogger,
  koaBody({
    multipart: true,
    formidable: {
      keepExtensions: true,
      maxFieldsSize: 5 * 1024 * 1024
    },
    onError: (err) => {
      console.log('koabody TCL: err', err)
    }
  }),
  statics(path.join(__dirname, '../public')),
  cors(),
  jsonutil({ pretty: false, param: 'pretty' }),
  helmet(),
  authCheck,
  // auth,
  recordsHandle,
  errorHandle,
  config.isDevMode
    ? log4js.koaLogger(log4js.getLogger('http'), {
        level: 'auto'
      })
    : log4js.koaLogger(log4js.getLogger('access'), {
      level: 'auto'
    })
])

if (!config.isDevMode) {
  app.use(compress())
}

app.use(middleware)
app.use(router())

app.listen(config.port, () => {
  const logger = log4js.getLogger('out')
  logger.info('app is runing at ' + config.baseUrl)
  logger.info('VERSION:' + process.env.VERSION)
  logger.info('BRANCH:' + process.env.BRANCH)
  logger.info('COMMIT_HASH:' + process.env.COMMIT)
})
