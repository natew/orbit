import Reconciler from 'react-reconciler'
import emptyObject from 'fbjs/lib/emptyObject'
import { createElement, getHostContextNode } from '../utils/createElement'
import * as ReactDOMFrameScheduling from './ReactDOMFrameScheduling'

const noop = () => {}

export default Reconciler({
  appendInitialChild(parentInstance, child) {
    parentInstance.appendChild(child)
  },

  createInstance(type, props) {
    return createElement(type, props)
  },

  createTextInstance(text) {
    return text
  },

  finalizeInitialChildren(instance, type, props) {
    if (!instance) return
    instance.applyProps(props)
    return false
  },

  getPublicInstance(instance) {
    return instance
  },

  prepareForCommit: noop,

  prepareUpdate(element, type, oldProps, newProps) {
    return true
  },

  resetAfterCommit: noop,
  resetTextContent: noop,

  getRootHostContext(instance) {
    return getHostContextNode(instance)
  },

  getChildHostContext() {
    return emptyObject
  },

  shouldSetTextContent(type, props) {
    return false
  },

  now: ReactDOMFrameScheduling.now,
  scheduleDeferredCallback: ReactDOMFrameScheduling.rIC,
  useSyncScheduling: true,

  mutation: {
    appendChild(parentInstance, child) {
      if (child) {
        parentInstance.appendChild(child)
      }
    },

    appendChildToContainer(parentInstance, child) {
      if (child) {
        parentInstance.appendChild(child)
      }
    },

    removeChild(parentInstance, child) {
      parentInstance.removeChild(child)
    },

    removeChildFromContainer(parentInstance, child) {
      parentInstance.removeChild(child)
    },

    insertBefore: noop,
    commitMount: noop,

    commitUpdate(instance, updatePayload, type, oldProps, newProps) {
      if (!instance) return
      instance.applyProps(newProps, oldProps)
    },

    commitTextUpdate(textInstance, oldText, newText) {
      textInstance.children = newText
    },
  },
})