export function getFirstDefined<T> (
  items: (T | undefined)[],
): (T & ({} | null)) | undefined {
  return items.find(item => item !== undefined)
}
