export * from '@mcro/constants'

import Path from 'path'
import getExtensions from '@mcro/chrome-extensions'

export const IS_PROD = process.env.NODE_ENV !== 'development'
export const IS_DEV = !IS_PROD
export const APP_URL = IS_PROD
  ? 'http://app.seemirai.com:3009'
  : 'http://localhost:3001'
export const APP_HOME = '/'
export const IS_MAC = process.platform === 'darwin'
export const ROOT_PATH = Path.join(__dirname, '..')

export const DEV_TOOLS_EXTENSIONS = getExtensions([
  // 'remoteDevtools',
  'mobx',
  'react',
])

export const WEB_PREFERENCES = {
  nativeWindowOpen: true,
  experimentalFeatures: false,
  transparentVisuals: true,
  allowRunningInsecureContent: false,
  plugins: true,
  scrollBounce: true,
  // offscreen: true,
}