import deepEqual from 'deep-equal'
import { Model, useRepo } from 'pinia-orm'
import { getClassRelationships } from 'pinia-orm-helpers'
import { BulkUpdateForm, UseBulkUpdaterReturn } from '../../contracts/bulk-update/UseBulkUpdater'
import { conformManyRelationIdArraysToObjectSyntax } from './conformManyRelationIdArraysToObjectSyntax'
import { conformBelongsToManyRelationsToObjectSyntax } from './conformBelongsToManyRelationsToObjectSyntax'
import { getRecordPrimaryKey } from '../../utils/getRecordPrimaryKey'

export function getFormsChangedValues<
  T extends typeof Model,
  R extends UseBulkUpdaterReturn<T>
> (
  options: {
    skipBelongsToMany?: boolean
    skipHasMany?: boolean
    id: string
    newValues: Record<string, any>
    repo: R['repo']
    driver: string
    belongsToManyRelationshipKeys?: string[]
    hasManyRelationshipKeys?: string[]
    pivotClasses: Record<string, Model>
    piniaOrmRelationships: ReturnType<typeof getClassRelationships>,
  },
) {
  const {
    id,
    newValues,
    repo,
    belongsToManyRelationshipKeys,
    hasManyRelationshipKeys,
    pivotClasses,
    driver,
    piniaOrmRelationships,
    skipBelongsToMany,
    skipHasMany,
  } = options

  const oldRecordQuery = repo.query()
  if (!skipBelongsToMany) {
    belongsToManyRelationshipKeys?.forEach(related => oldRecordQuery.with(related))
  }
  if (!skipHasMany) {
    hasManyRelationshipKeys?.forEach(related => oldRecordQuery.with(related))
  }

  const foundOldRecord = oldRecordQuery.find(id) ?? {}

  const oldBelongsToManyRecordRelateds = belongsToManyRelationshipKeys ? conformBelongsToManyRelationsToObjectSyntax(
    foundOldRecord,
    belongsToManyRelationshipKeys,
    pivotClasses,
    driver,
  ) : {}

  const oldHasManyRecordRelateds = Object.fromEntries(hasManyRelationshipKeys?.map(key => {
    const records = foundOldRecord[key] ?? []
    return [key, records.map(record => getRecordPrimaryKey(piniaOrmRelationships[key].related, record))]
  }) ?? [])

  const oldRecord = { ...repo.find(id), ...oldBelongsToManyRecordRelateds, ...oldHasManyRecordRelateds }
  const newRecord = newValues
  if (belongsToManyRelationshipKeys && !skipBelongsToMany) {
    Object.assign(newRecord, conformManyRelationIdArraysToObjectSyntax(newValues, belongsToManyRelationshipKeys))
  }
  // if (hasManyRelationshipKeys && !skipHasMany) {
  //   Object.assign(newRecord, conformManyRelationIdArraysToObjectSyntax(newValues, hasManyRelationshipKeys))
  // }

  const recordChangedValuesOnly: BulkUpdateForm<InstanceType<T>> = {}

  if (!oldRecord) {
    throw new Error('Error discovering changed values. Could not find old record in the store')
  }

  Object.entries(newRecord).forEach((entry) => {
    const key = entry[0] as keyof BulkUpdateForm<InstanceType<T>>
    const value = entry[1] as BulkUpdateForm<InstanceType<T>>

    // Handle Belongs To Many
    if (!skipBelongsToMany && belongsToManyRelationshipKeys?.includes(key)) {
      // if it's the pivot, skip it
      if (pivotClasses[key]) return

      const relationship = piniaOrmRelationships[key]

      // build the object forms
      if (relationship.kind === 'BelongsToMany') {
        const PivotClass = relationship.pivot
        if (!recordChangedValuesOnly[key]) {
          recordChangedValuesOnly[key] = {} as any
        }
        Object.entries(newRecord[key]).forEach(entry => {
          const pivotId = entry[0]
          const pivotNewValues = entry[1] as Record<string, any>

          const newValuesPivot = getFormsChangedValues({
            driver,
            id: pivotId,
            newValues: pivotNewValues,
            pivotClasses,
            piniaOrmRelationships,
            repo: useRepo(PivotClass.constructor as any),
          })
          // if (!recordChangedValuesOnly[key]) {
          //   recordChangedValuesOnly[key] = {} as any
          // }
          if (!recordChangedValuesOnly[key][pivotId]) {
            recordChangedValuesOnly[key][pivotId] = newValuesPivot
          }
        })
      }

      // if all ids are the same
      const newIds = Object.keys(recordChangedValuesOnly?.[key] as any ?? {})
      const oldIds = oldRecord[key]?.map((record: Model) => getRecordPrimaryKey(relationship.related.constructor as typeof Model, record)) ?? []
      if (newIds.length !== oldIds.length) return

      const idsAreTheSame = JSON.stringify(newIds.sort()) === JSON.stringify(oldIds.sort())
      const hasPivotWithValues = Object.values(newIds as any)
        .some(form => {
          if (typeof form !== 'object') return false
          return !!Object.values(form ?? {}).length
        })

      if (idsAreTheSame && !hasPivotWithValues) {
        delete recordChangedValuesOnly[key]
      }
      // Handle many to many
    } else if (!skipHasMany && hasManyRelationshipKeys?.includes(key)) {
      const newIds = newRecord[key] ?? []
      const oldIds = oldHasManyRecordRelateds[key] ?? []

      const idsAreTheSame = JSON.stringify(newIds.sort()) === JSON.stringify(oldIds.sort())

      if (idsAreTheSame) {
        delete recordChangedValuesOnly[key]
      } else {
        recordChangedValuesOnly[key] = newIds
      }
    } else if (!deepEqual(oldRecord[key], newRecord[key])) {
      recordChangedValuesOnly[key] = value as any
    }
  })

  return recordChangedValuesOnly
}
