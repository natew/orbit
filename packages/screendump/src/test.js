import { screen } from './index'

const x = screen({
  destination: '/tmp/osx.png',
  bounds: [840, 1028],
  offset: [840, 22],

  // scale: 0.75,
})

console.log(x)