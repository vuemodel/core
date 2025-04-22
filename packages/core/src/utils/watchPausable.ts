import { watch, WatchSource, WatchOptions, WatchCallback } from 'vue'

export function watchPausable<T> (
  source: WatchSource<T> | WatchSource<T>[],
  cb: WatchCallback,
  options?: WatchOptions,
) {
  let isPaused = false

  const stop = watch(
    source,
    (...args) => {
      if (!isPaused) {
        cb(...args)
      }
    },
    options,
  )

  const pause = () => {
    isPaused = true
  }

  const resume = () => {
    isPaused = false
  }

  return {
    pause,
    resume,
    stop,
    isPaused: () => isPaused,
  }
}
