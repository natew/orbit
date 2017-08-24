import { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDom from 'react-dom'

const useCreatePortal = typeof ReactDom.unstable_createPortal === 'function'

export default class Portal extends Component {
  static propTypes = {
    children: PropTypes.node,
  }

  componentWillMount() {
    this.popup = document.createElement('div')
    document.body.appendChild(this.popup)
    this.renderLayer()
  }

  componentDidUpdate() {
    this.renderLayer()
  }

  componentWillUnmount() {
    if (!useCreatePortal) {
      ReactDom.unmountComponentAtNode(this.popup)
    }
    document.body.removeChild(this.popup)
  }

  renderLayer() {
    if (!useCreatePortal) {
      ReactDom.unstable_renderSubtreeIntoContainer(
        this,
        this.props.children,
        this.popup
      )
    }
  }

  render() {
    if (useCreatePortal) {
      return ReactDom.unstable_createPortal(this.props.children, this.popup)
    }
    return null
  }
}