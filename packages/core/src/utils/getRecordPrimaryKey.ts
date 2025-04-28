import { Model } from 'pinia-orm'

export function getRecordPrimaryKey<T extends typeof Model> (
  ModelClass: T | InstanceType<T>,
  rawRecord: any,
) {
  const primaryKeyField = ModelClass instanceof Model ? ModelClass.$primaryKey() : ModelClass.primaryKey

  if (Array.isArray(primaryKeyField)) {
    const key = primaryKeyField.map(field => rawRecord[field as keyof typeof rawRecord])
    return key ? JSON.stringify(key) : undefined
  }

  const key = rawRecord?.[primaryKeyField as unknown as (keyof typeof rawRecord)]
  return key ? String(key) : undefined
}
