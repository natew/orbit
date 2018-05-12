import { ThemeMaker, color } from '@mcro/ui'
import * as Constants from '~/constants'

const Theme = new ThemeMaker()

const highlightColor = '#fff'
const highlightBackground = Constants.ORBIT_COLOR

const blank = {
  highlightBackground: 'transparent',
  highlightColor: 'transparent',
  background: 'transparent',
  color: '#fff',
  borderColor: 'transparent',
  buttonBackground: 'transparent',
}

const tanBg = color('rgb(255,255,245)')
const tanHoverBg = tanBg.darken(0.02).desaturate(0.3)
const tanActiveBg = tanHoverBg.darken(0.05).desaturate(0.3)
const tanActiveHoverBg = tanHoverBg.darken(0.06).desaturate(0.3)

const dbBg = color('rgb(11, 60, 117)')
const dbHoverBg = dbBg.darken(0.02).desaturate(0.3)
const dbActiveBg = dbHoverBg.darken(0.05).desaturate(0.3)
const dbActiveHoverBg = dbHoverBg.darken(0.06).desaturate(0.3)

const Themes = {
  tan: Theme.fromStyles({
    background: tanBg,
    color: '#656141',
    borderColor: tanActiveBg,
    hover: {
      background: tanHoverBg,
    },
    selected: {
      background: color('#fff'),
    },
    active: {
      background: tanActiveBg,
    },
    activeHover: {
      background: tanActiveHoverBg,
    },
  }),
  darkBlue: Theme.fromStyles({
    background: dbBg,
    color: '#fff',
    borderColor: dbActiveBg,
    hover: {
      background: dbHoverBg,
    },
    selected: {
      background: color('#fff'),
    },
    active: {
      background: dbActiveBg,
    },
    activeHover: {
      background: dbActiveHoverBg,
    },
  }),
  dark: Theme.fromStyles({
    highlightBackground: [0, 0, 0, 0.05],
    highlightColor,
    background: 'rgba(20,20,20,0.94)',
    color: '#fff',
    borderColor: '#222',
    hover: {
      background: color([255, 255, 255, 0.01]),
    },
    selected: {
      background: color([255, 255, 255, 0.02]),
    },
    active: {
      background: color([255, 255, 255, 0.03]),
    },
    activeHover: {
      background: color([255, 255, 255, 0.025]),
    },
  }),
  light: Theme.fromStyles({
    background: color('#fff'),
    color: color('#444'),
    borderColor: color('#999'),
    hover: {
      background: color('#eee'),
    },
    selected: {
      background: color('#ddd'),
    },
    active: {
      background: color('#ddd'),
    },
    activeHover: {
      background: color('#ccc'),
    },
  }),
  blank: {
    base: blank,
    hover: blank,
    active: blank,
    focus: blank,
    highlight: blank,
  },
  clear: {
    button: {
      borderTopWidth: 0,
      borderLeftWidth: 0,
      borderRightWidth: 0,
    },
    glow: {
      color: [255, 255, 255, 0.1],
    },
    ...Theme.fromStyles({
      highlightBackground,
      highlightColor,
      background: [255, 255, 255, 1],
      color: '#555',
      borderColor: [0, 0, 0, 0.1],
    }),
  },
}

window.Themes = Themes

export default Themes
