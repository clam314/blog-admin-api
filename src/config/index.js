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

const JWT_SECRET = process.env.JWT_SECRET

const port = 4000

const baseUrl = process.env.NODE_ENV === 'production' ? 'http://192.168.50.13:' + port : 'http://localhost:' + port

const uploadPath = process.env.NODE_ENV === 'production' ? '/app/public' : path.join(path.resolve(__dirname), '../../public')

const publicPath = ['/public', '/login', '/blog']

const isDevMode = process.env.NODE_ENV !== 'production'

export default {
  DB_NAME,
  MONGO_HOSTNAME,
  DB_URL,
  JWT_SECRET,
  baseUrlPrefix,
  getUrlPrefixStr,
  baseUrl,
  uploadPath,
  publicPath,
  isDevMode,
  port
}
