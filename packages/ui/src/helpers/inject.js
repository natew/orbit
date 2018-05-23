import { inject as injector } from '@mcro/react-tunnel'

// adds object fallback if not defined
export function inject(mapProvidedToProps) {
  return injector(props => mapProvidedToProps(props) || {})
}
