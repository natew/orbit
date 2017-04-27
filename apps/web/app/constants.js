export const IS_PROD = process.env.NODE_ENV === 'production'

export const DB_CONFIG = {
  name: 'username',
  password: 'password',
  couchUrl: IS_PROD ? 'https://mirai.cloudant.com' : 'http://localhost:5984', //'https://jot-app-api.herokuapp.com/couch',
}

export const HEADER_HEIGHT = 40
export const SIDEBAR_WIDTH = 210
