import { Model } from 'pinia-orm'
import { getMergedDriverConfig } from './getMergedDriverConfig'

export function getPivotModelIdField (
  ModelClass: Model,
  options?: {
    driver?: string
  },
): string {
  const config = getMergedDriverConfig(options?.driver)

  const fieldNameFromMap = config.pivotIdFieldMap?.[ModelClass.entity]
  if (fieldNameFromMap) return fieldNameFromMap
  if (typeof config.pivotIdField === 'function') {
    return config.pivotIdField(ModelClass)
  }
  return config.pivotIdField ?? 'id'
}
