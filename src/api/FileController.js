import sent from 'koa-send'
import { promises as fsp } from 'fs'
import config from '@/config/index'

const imgPath = ['webp', 'img']

class FileController {
  async randomImg (ctx) {
    const { img } = ctx.request.query
    if (!img || !imgPath.includes(img.toLowerCase())) {
      ctx.status = 404
      return
    }
    const { accept } = ctx.headers
    const isSupportWebP = accept ? /image\/webp/.test(accept) : false
    const dir = `${config.uploadPath}/${isSupportWebP ? imgPath[0] : imgPath[1]}`
    const images = await fsp.readdir(dir)
    const fileName = images[Math.floor(Math.random() * images.length)]
    ctx.status = 302
    const url = `${config.baseUrl}/${config.serverPath}/${isSupportWebP ? 'webp' : 'img'}/${fileName}`
    ctx.redirect(url)
  }

  async randomImgFile (ctx) {
    const { img } = ctx.request.query
    if (!img || !imgPath.includes(img.toLowerCase())) {
      ctx.status = 404
      return
    }
    const { accept } = ctx.headers
    const isSupportWebP = accept ? /image\/webp/.test(accept) : false
    const dir = `${config.uploadPath}/${isSupportWebP ? imgPath[0] : imgPath[1]}`
    const images = await fsp.readdir(dir)
    const fileName = images[Math.floor(Math.random() * images.length)]
    await sent(ctx, fileName, {
      root: dir,
      immutable: true
    })
  }
}

export default new FileController()
