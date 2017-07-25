import * as UI from '@mcro/ui'
import GeoPattern from 'geopattern'

export default ({ id, size = 30, ...props }) =>
  <UI.Circle
    size={size}
    background={GeoPattern.generate(`${id}` || Math.random()).toDataUrl()}
    fontSize={20}
    color="white"
    overflow="hidden"
    transition="transform ease-in 30ms"
    transform={{
      scale: 1.0,
    }}
    contentEditable={false}
    {...props}
  />