import { Model } from 'pinia-orm'
import { DeclassifyPiniaOrmModel, PiniaOrmForm } from 'pinia-orm-helpers'

export function getRecordPrimaryKey<T extends typeof Model> (
  ModelClass: T | InstanceType<T>,
  rawRecord: PiniaOrmForm<InstanceType<T>> | DeclassifyPiniaOrmModel<InstanceType<T>> | InstanceType<T>,
) {
  const primaryKeyField = ModelClass instanceof Model ? ModelClass.$primaryKey() : ModelClass.primaryKey

  if (Array.isArray(primaryKeyField)) {
    /* @ts-expect-error this is hard to type */
    const key = primaryKeyField.map(field => rawRecord[field as keyof typeof rawRecord])
    return key ? JSON.stringify(key) : undefined
  }

  const key = rawRecord?.[primaryKeyField as unknown as (keyof typeof rawRecord)]
  return key ? String(key) : undefined
}
