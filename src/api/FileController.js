import sent from 'koa-send'
import { promises as fsp, createReadStream } from 'fs'
import config from '@/config/index'

const imgPath = ['webp', 'img']

class FileController {
  async randomImg (ctx) {
    const { img } = ctx.request.query
    if (!img || !imgPath.includes(img.toLowerCase())) {
      ctx.status = 404
      return
    }
    const dir = `${config.uploadPath}/${img.toLocaleString()}`
    const images = await fsp.readdir(dir)
    console.log('images: ', images)
    const fileName = images[Math.floor(Math.random() * images.length)]
    await sent(ctx, fileName, {
      root: dir,
      immutable: true
    })
  }
}

export default new FileController()
