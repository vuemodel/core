import { Model } from 'pinia-orm'
import { VueModelConfig } from '../plugin/state'
import { v4 as uuidV4 } from 'uuid'

export function makeId<T extends typeof Model> (
  ModelClass: T,
  driver: VueModelConfig,
): string {
  const entity = ModelClass.entity

  const idMaker = driver.makeIdMap?.[entity] ??
  driver.makeId

  if (idMaker) {
    return idMaker(ModelClass)
  }

  return uuidV4()
}
