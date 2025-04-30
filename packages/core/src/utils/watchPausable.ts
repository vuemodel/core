import { watch, WatchSource, WatchOptions, WatchCallback, WatchHandle } from 'vue'

export function watchPausable<T> (
  source: WatchSource<T> | WatchSource<T>[],
  cb: WatchCallback,
  options?: WatchOptions,
): {
  pause: () => void;
  resume: () => void;
  stop: WatchHandle;
  isPaused: () => boolean;
} {
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

  const pause = (): void => {
    isPaused = true
  }

  const resume = (): void => {
    isPaused = false
  }

  return {
    pause,
    resume,
    stop,
    isPaused: () => isPaused,
  }
}
