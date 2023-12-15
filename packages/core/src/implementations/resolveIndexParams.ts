import { IndexIdsParam, IndexOptionsParam } from '../types/UseIndexerParams'
import { Model } from 'pinia-orm'

export function resolveIndexParams<T extends typeof Model> (
  optionsOrId?: IndexIdsParam | IndexOptionsParam<T>,
  options?: IndexOptionsParam<T>,
): {
  ids?: IndexIdsParam
  options: IndexOptionsParam<T>
} {
  if (Array.isArray(optionsOrId)) {
    return {
      ids: optionsOrId,
      options: options ?? {},
    }
  }
  return {
    options: optionsOrId ?? {},
  }
}
