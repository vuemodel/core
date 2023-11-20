import { PrimaryKey } from 'pinia-orm'
import { VueModelPrimaryKey } from '../types/VueModelPrimaryKey'

export function makePiniaOrmPrimaryKey (
  primaryKey: VueModelPrimaryKey,
): PrimaryKey {
  if (Array.isArray(primaryKey)) {
    return primaryKey.map(key => String(key))
  }
  return String(primaryKey)
}
