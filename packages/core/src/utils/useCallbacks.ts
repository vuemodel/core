export type Callback<T extends any[]> = (...args: T) => void | Promise<void>;

export type UseCallbacksReturn<T extends any[]> = {
  add(callback: Callback<T>): void;
  run(...args: T): Promise<void>;
}

export function useCallbacks<T extends any[]> (
  initialCallbacks?: (Callback<T> | undefined)[],
): UseCallbacksReturn<T> {
  const callbacks: Callback<T>[] = initialCallbacks?.filter(
    (callback): callback is Callback<T> => typeof callback === 'function',
  ) ?? []

  return {
    add (callback: Callback<T>) {
      callbacks.push(callback)
    },
    async run (...args: T) {
      for (const callback of callbacks) {
        await callback(...args)
      }
    },
  }
}
