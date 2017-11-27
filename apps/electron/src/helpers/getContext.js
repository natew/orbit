import runAppleScript from './runAppleScript'
import escapeAppleScriptString from 'escape-string-applescript'
import getFavicon from './getFavicon'

export async function getActiveWindowInfo() {
  const [application, title] = await runAppleScript(`
  global frontApp, frontAppName, windowTitle
  set windowTitle to ""
  tell application "System Events"
    set frontApp to first application process whose frontmost is true
    set frontAppName to name of frontApp
    tell process frontAppName
      tell (1st window whose value of attribute "AXMain" is true)
        set windowTitle to value of attribute "AXTitle"
      end tell
    end tell
  end tell
  return {frontAppName, windowTitle}
  `)
  // application is like 'Google Chrome'
  // title is like 'Welcome to my Webpage'
  return { application, title }
}

const getFaviconSrc = getFavicon.toString()

const CONTEXT_JS = `
JSON.stringify({
  url: document.location+'',
  title: document.title,
  selection: document.getSelection().toString() ? document.getSelection().toString() : (document.getSelection().anchorNode ? document.getSelection().anchorNode.textContent : ''),
  crawlerInfo: document.__oraCrawlerAnswer,
  favicon: ${getFaviconSrc}(),
})
`

export async function getChromeContext() {
  const res = await runAppleScript(`
    tell application "Google Chrome"
      tell front window's active tab
        set source to execute javascript "${escapeAppleScriptString(
          CONTEXT_JS
        )}"
      end tell
    end tell
  `)
  if (res === 'missing value') {
    console.log('missing value')
    return null
  }
  try {
    const result = JSON.parse(res)
    if (!result) {
      return null
    }
    return result
  } catch (err) {
    console.log('error parsing json')
    console.log('res:', res)
    console.log(err)
    return null
  }
}