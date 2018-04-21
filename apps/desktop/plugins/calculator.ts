import Mexp from 'math-expression-evaluator'

export const fn = ({ term, display }) => {
  if (!term) {
    return display([])
  }
  let res
  try {
    res = `${Mexp.eval(term)}`
  } catch (err) {
    display([])
    return
  }
  if (res !== term) {
    display([
      {
        id: -1,
        title: res,
      },
    ])
  } else {
    display([])
  }
}