import path from 'path'

const MONGO_USERNAME = process.env.DB_USER
const MONGO_PASSWORD = process.env.DB_PASS
const MONGO_HOSTNAME = process.env.DB_HOST
const MONGO_PORT = process.env.DB_PORT
const DB_NAME = process.env.DB_NAME

const DB_URL = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${DB_NAME}`

const baseUrlPrefix = '/api'

const getUrlPrefixStr = (str) => {
  return baseUrlPrefix + str
}

const PRIVATE_KEY = process.env.PRIVATE_KEY

const JWT_SECRET = process.env.JWT_SECRET

const port = process.env.PORT

const baseUrl = `${process.env.BASE_URL}:${port}`

const uploadPath = process.env.NODE_ENV === 'production' ? '/app/public' : path.join(path.resolve(__dirname), '../../public')

const publicPath = ['/public', '/login', '/blog']

const isDevMode = process.env.NODE_ENV !== 'production'

export default {
  DB_NAME,
  MONGO_HOSTNAME,
  DB_URL,
  JWT_SECRET,
  PRIVATE_KEY,
  baseUrlPrefix,
  getUrlPrefixStr,
  baseUrl,
  uploadPath,
  publicPath,
  isDevMode,
  port
}
