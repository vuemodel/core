import { Model } from 'pinia-orm'
import { DeclassifyPiniaOrmModel, PiniaOrmForm } from 'pinia-orm-helpers'

export function getRecordPrimaryKey<T extends typeof Model> (
  ModelClass: T,
  rawRecord: PiniaOrmForm<InstanceType<T>> | DeclassifyPiniaOrmModel<InstanceType<T>> | InstanceType<T>,
) {
  const primaryKeyField = ModelClass.primaryKey
  if (Array.isArray(primaryKeyField)) {
    const key = primaryKeyField.map(field => rawRecord[field as keyof typeof rawRecord])
    return key ? JSON.stringify(key) : undefined
  }

  const key = rawRecord?.[primaryKeyField as (keyof typeof rawRecord)]
  return key ? String(key) : undefined
}
