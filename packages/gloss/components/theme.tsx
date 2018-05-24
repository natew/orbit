import * as React from 'react'
import { object, string } from 'prop-types'

export class Theme extends React.Component {
  props: {
    name?: string
    theme?: any
    children: any
  }
  context: {
    uiTheme: Object
    uiActiveTheme: string
    theme: Object
  }

  static contextTypes = {
    uiActiveTheme: string,
    uiTheme: object,
  }

  static childContextTypes = {
    uiActiveTheme: string,
    theme: object,
  }

  getChildContext() {
    if (this.props.name) {
      const uiActiveTheme = this.props.name || this.props.theme
      if (!this.context.uiTheme) {
        console.error('No theme in the context!')
        return { uiActiveTheme }
      }
      return {
        uiActiveTheme,
        theme: this.context.uiTheme[uiActiveTheme],
      }
    }
    return {
      uiActiveTheme: this.context.uiActiveTheme || '',
      theme: this.context.theme || {},
    }
  }

  render() {
    return this.props.children
  }
}