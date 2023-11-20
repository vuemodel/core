import { IndexIdsParam, IndexOptionsParam } from '../types/UseIndexerParams'

export function resolveIndexParams (
  optionsOrId?: IndexIdsParam | IndexOptionsParam,
  options?: IndexOptionsParam,
): {
  ids?: IndexIdsParam
  options: IndexOptionsParam
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
