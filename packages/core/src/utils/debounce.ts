/* eslint-disable @typescript-eslint/ban-types */
export default function debounce<T extends Function> (
  fn: T,
  wait = 250,
  immediate?: boolean,
): T {
  let timer: T = null

  function debounced (/* ...args */) {
    const args = arguments

    const later = () => {
      timer = null
      if (immediate !== true) {
        fn.apply(this, args)
      }
    }

    if (timer !== null) {
      clearTimeout(timer)
    } else if (immediate === true) {
      fn.apply(this, args)
    }

    timer = setTimeout(later, wait)
  }

  debounced.cancel = () => {
    timer !== null && clearTimeout(timer)
  }

  return <T>(<any>debounced)
}
