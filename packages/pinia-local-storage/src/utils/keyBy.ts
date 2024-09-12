type KeyByCallback<T> = (item: T) => string;

export function keyBy<T> (array: T[], key: string | KeyByCallback<T>): Record<string, T> {
  return array.reduce((acc, item) => {
    const keyValue = typeof key === 'function' ? key(item) : (item as any)[key]
    acc[keyValue] = item
    return acc
  }, {} as Record<string, T>)
}
