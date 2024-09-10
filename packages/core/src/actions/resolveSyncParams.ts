import { Model } from 'pinia-orm'
import { FilterPiniaOrmModelToManyRelationshipTypes } from '../types/FilterPiniaOrmModelToManyRelationshipTypes'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { SyncOptions } from '../contracts/sync/Sync'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'

export function resolveSyncParams<T extends typeof Model> (...params: any[]): {
  ModelClass: T,
  id: LoosePrimaryKey,
  related: keyof FilterPiniaOrmModelToManyRelationshipTypes<InstanceType<T>>,
  forms: string[] | number[] | Record<string, DeclassifyPiniaOrmModel<InstanceType<T>>>,
  options?: SyncOptions<T>
} {
  if (typeof params[0] === 'string') {
    const paramsWithoutDriver = params.slice(1)
    return {
      ModelClass: paramsWithoutDriver[0],
      id: paramsWithoutDriver[1],
      related: paramsWithoutDriver[2],
      forms: paramsWithoutDriver?.[3] ?? {},
      options: paramsWithoutDriver?.[4] ?? {},
    }
  }

  return {
    ModelClass: params[0],
    id: params[1],
    related: params[2],
    forms: params?.[3] ?? {},
    options: params?.[4] ?? {},
  }
}
