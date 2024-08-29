import deepEqual from 'deep-equal'
import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { UseBatchUpdaterReturn } from '../../contracts/batch-update/UseBatchUpdater'

export function getFormsChangedValues<
  T extends typeof Model,
  R extends UseBatchUpdaterReturn<T>
> (
  options: {
    id: string
    newValues: Record<string, any>
    repo: R['repo']
  },
) {
  const { id, newValues, repo } = options

  const oldRecord = repo.find(id)
  const newRecord = newValues
  const recordChangedValuesOnly: PiniaOrmForm<InstanceType<T>> = {}

  if (!oldRecord) {
    throw new Error('Error discovering changed values. Could not find old record in the store')
  }

  Object.entries(newRecord).forEach(([key, value]) => {
    if (!deepEqual(oldRecord[key], newRecord[key])) {
      /* @ts-expect-error we know this key will exist */
      recordChangedValuesOnly[key] = value
    }
  })

  return recordChangedValuesOnly
}
