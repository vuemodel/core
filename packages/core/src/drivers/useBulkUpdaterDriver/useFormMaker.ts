import clone from 'just-clone'
import { Collection, Model } from 'pinia-orm'
import { FilterPiniaOrmModelToFieldTypes, FilterPiniaOrmModelToRelationshipTypes, getClassRelationships, PiniaOrmForm } from 'pinia-orm-helpers'
import { computed, nextTick, toValue, watch, WatchStopHandle } from 'vue'
import { BulkUpdateForm, BulkUpdateMeta, UseBulkUpdaterOptions, UseBulkUpdaterReturn } from '../../contracts/bulk-update/UseBulkUpdater'
import { getFormsChangedValues } from './getFormsChangedValues'
import deepEqual from 'deep-equal'
import { IndexFilters } from '../../contracts/crud/index/IndexFilters'
import { getRecordPrimaryKey } from '../../utils/getRecordPrimaryKey'
import { FilterPiniaOrmModelToManyRelationshipTypes } from '../../types/FilterPiniaOrmModelToManyRelationshipTypes'
import { getPivotModelIdField } from '../../utils/getPivotModelIdField'
import { applyWiths } from '../../utils/applyWiths'
import { IndexWiths } from '@vuemodel/core'

export function useFormMaker<
  T extends typeof Model,
  R extends UseBulkUpdaterReturn<T>
> (
  options: {
    ModelClass: T,
    belongsToManyRelationshipKeys: (keyof FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>)[],
    piniaOrmRelationships: ReturnType<typeof getClassRelationships>,
    repo: R['repo']
    changes: R['changes']
    indexerWith: () => IndexWiths<InstanceType<T>>
    pauseAutoUpdater: () => void
    resumeAutoUpdater: () => void
    primaryKeyField: string | string[]
    formsKeyed: R['formsKeyed']
    fieldKeys: (keyof FilterPiniaOrmModelToFieldTypes<InstanceType<T>>)[]
    meta: R['meta']
    formWatchers: Record<string, WatchStopHandle>
    indexer: R['indexer']
    pivotClasses: Record<string, Model>
    driver: string
    updaterOptions: UseBulkUpdaterOptions<T>,
    withBulkUpdaters: Record<string, { composable: UseBulkUpdaterReturn, isMany: boolean }>
  },
) {
  const {
    formsKeyed,
    pivotClasses,
    belongsToManyRelationshipKeys,
    piniaOrmRelationships,
    pauseAutoUpdater,
    primaryKeyField,
    fieldKeys,
    meta,
    formWatchers,
    resumeAutoUpdater,
    changes,
    repo,
    indexer,
    driver,
    indexerWith,
    updaterOptions,
    ModelClass,
    withBulkUpdaters,
  } = options

  // const formRecordWatchers: any = {}

  // belongsToManyRelationshipKeys

  const defaultFieldMetas = Object.fromEntries<{
    changed: boolean
    changes: BulkUpdateForm<InstanceType<T>>
    updating: boolean
    failed: boolean
    initialValue: any
    errors: string[]
  }>(
    fieldKeys.map(field => {
      return [
        field,
        {
          changed: false,
          updating: false,
          failed: false,
          initialValue: null,
          changes: {},
          errors: [],
        },
      ]
    }),
  )

  const defaultBelongsToManyMetas = Object.fromEntries<{
    changed: boolean
    changes: BulkUpdateForm<InstanceType<T>>
    updating: boolean
    failed: boolean
    initialValue: any
    errors: string[]
  }>(
    belongsToManyRelationshipKeys.map(field => {
      return [
        field,
        {
          changed: false,
          updating: false,
          failed: false,
          initialValue: null,
          changes: {},
          errors: [],
        },
      ]
    }),
  )

  function makeDefaultMeta (id: string): BulkUpdateMeta<InstanceType<T>> {
    const defaultMeta = {
      changed: false,
      failed: false,
      changes: {},
      standardErrors: [],
      validationErrors: {},
      fields: {
        ...defaultFieldMetas,
        ...defaultBelongsToManyMetas,
      },
      initialValues: {},
      makingForm: false,
      updating: false,
      form: {},
      record: computed(() => {
        const query = repo.query()
        applyWiths(
          ModelClass,
          query,
          toValue(indexerWith),
          {
            withoutEntityGlobalScopes: updaterOptions.indexer?.withoutEntityGlobalScopes,
            withoutGlobalScopes: updaterOptions.indexer?.withoutGlobalScopes,
          },
        )
        return query.find(id)
      }),
      id,
    }

    // if (!recordWatchers[id]) {
    //   recordWatchers[id] = watch(defaultMeta.record, () => {
    //     makeForms([id])
    //   })
    // }

    return defaultMeta
  }

  function addRawForm (id: string, form: PiniaOrmForm<InstanceType<T>>) {
    meta.value[id] = makeDefaultMeta(id)
    meta.value[id].initialValues = clone(form)
    meta.value[id].id = id
    meta.value[id].form = formsKeyed.value[id]
  }

  function addRawForms (forms: Record<string, PiniaOrmForm<InstanceType<T>>>) {
    Object.entries(forms).forEach(([id, form]) => addRawForm(id, form))
  }

  function makeFromModels (models: Collection<Model>) {
    pauseAutoUpdater()
    for (const model of models) {
      const id = model[primaryKeyField as string] as string

      if (!formsKeyed.value[id]) {
        formsKeyed.value[id] = {}
      }

      fieldKeys.forEach(field => {
        if (field !== primaryKeyField) {
          let initialFieldValue = model[field]
          if (typeof model[field] === 'object') {
            initialFieldValue = clone(model[field])
          }
          formsKeyed.value[id][field] = initialFieldValue

          meta.value[id].fields[field] = {
            changed: false,
            updating: false,
            failed: false,
            initialValue: initialFieldValue,
            errors: [],
          }
        }
      })

      belongsToManyRelationshipKeys.forEach((field: keyof FilterPiniaOrmModelToManyRelationshipTypes<InstanceType<T>>) => {
        if (pivotClasses[field]) return
        const RelatedModel = piniaOrmRelationships[field].related

        const relatedsIds: string[] = []
        model[field]?.forEach((relatedRecord: Model) => {
          const relatedId = pivotClasses[field]
            ? relatedRecord[getPivotModelIdField(pivotClasses[field], { driver })]
            : getRecordPrimaryKey(RelatedModel, relatedRecord)
          if (relatedId) relatedsIds.push(relatedId)
        })

        const initialFieldValue = relatedsIds
        formsKeyed.value[id][field] = initialFieldValue as any

        meta.value[id].fields[field] = {
          changed: false,
          updating: false,
          failed: false,
          errors: [],
          initialValue: initialFieldValue as any,
        }
      })

      if (!formWatchers[id]) {
        formWatchers[id] = watch(() => formsKeyed.value[id], (newValues) => {
          const changedValues = getFormsChangedValues({
            piniaOrmRelationships,
            id,
            newValues,
            repo,
            belongsToManyRelationshipKeys,
            pivotClasses,
            driver: options.driver,
          })
          const hasChanges = !!Object.values(changedValues).length
          if (hasChanges) {
            changes.value[id] = changedValues
          } else {
            delete changes.value[id]
          }
          meta.value[id].changed = hasChanges
          Object.entries(meta.value[id].fields).forEach(changeEntry => {
            const field = changeEntry[0]
            /* @ts-expect-error hard to type, no benefit */
            const formsFieldValue = formsKeyed.value[id][field]
            /* @ts-expect-error hard to type, no benefit */
            const initialValue = meta.value[id].fields[field].initialValue
            /* @ts-expect-error hard to type, no benefit */
            meta.value[id].fields[field].changed = !deepEqual(formsFieldValue, initialValue)
          })
        }, { deep: true })
      }

      meta.value[id].initialValues = clone(formsKeyed.value[id])
      meta.value[id].changed = false

      meta.value[id].id = id
      meta.value[id].form = formsKeyed.value[id]

      // Make forms for related records
      Object.entries(withBulkUpdaters).forEach(([relationshipKey, { composable, isMany }]) => {
        if (isMany) {
          const primaryKeyField = String(composable.ModelClass.primaryKey)

          /** @ts-expect-error hard to type, not worth it */
          if (!meta.value[id][relationshipKey + '_forms']) {
          /** @ts-expect-error hard to type, not worth it */
            meta.value[id][relationshipKey + '_forms'] = computed(() => {
              return (meta.value[id].record as any)?.[relationshipKey]
                ?.map((relatedRecord: any) => {
                  return composable.meta.value?.[relatedRecord[primaryKeyField]] ?? null as BulkUpdateMeta | null
                }) ?? []
            })
          }
        } else {
          const primaryKeyField = String(composable.ModelClass.primaryKey)

          /** @ts-expect-error hard to type, not worth it */
          if (!meta.value[id][relationshipKey + '_form']) {
          /** @ts-expect-error hard to type, not worth it */
            meta.value[id][relationshipKey + '_form'] = computed(() => {
              const primaryKey = (meta.value[id].record as any)[relationshipKey]?.[primaryKeyField]

              return composable.meta.value?.[primaryKey] ?? null as BulkUpdateMeta | null
            })
          }
        }
      })
    }
    nextTick(() => resumeAutoUpdater())
  }

  async function makeForms (
    targetIds?: string[],
  ): Promise<Record<string, PiniaOrmForm<InstanceType<T>>>> {
    const missingModelIds: string[] = []

    if (!targetIds) {
      targetIds = repo.all().map(record => record.id)
    }

    for (const targetId of targetIds) {
      if (!meta.value[targetId]) {
        meta.value[targetId] = makeDefaultMeta(targetId)
      }

      const foundModel = indexer.makeQuery({
        omitFilters: true,
        omitOrderBy: true,
        omitWhereIdFilter: true,
      }).find(targetId)

      if (!foundModel) {
        missingModelIds.push(targetId)
      } else {
        makeFromModels([foundModel])
      }
    }

    if (missingModelIds.length) {
      const indexFilters: IndexFilters<InstanceType<T>> = {}
      /* @ts-expect-error hard to type, no benefit */
      indexFilters[primaryKeyField] = { in: missingModelIds }

      await indexer.index({ filters: indexFilters })

      makeFromModels(
        indexer.makeQuery().whereId(missingModelIds).get(),
      )
      missingModelIds.forEach(id => {
        meta.value[id].makingForm = false
      })
    }

    return {}
  }

  return {
    makeFromModels,
    makeForms,
    addRawForms,
  }
}
