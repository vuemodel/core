import clone from 'just-clone'
import { Collection, Item, Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { computed, nextTick, toValue, watch } from 'vue'
import { BulkUpdateForm, BulkUpdateMeta } from '../../contracts/bulk-update/UseBulkUpdater'
import { getFormsChangedValues } from './getFormsChangedValues'
import deepEqual from 'deep-equal'
import { IndexFilters } from '../../contracts/crud/index/IndexFilters'
import { getRecordPrimaryKey } from '../../utils/getRecordPrimaryKey'
import { FilterPiniaOrmModelToManyRelationshipTypes } from '../../types/FilterPiniaOrmModelToManyRelationshipTypes'
import { getPivotModelIdField } from '../../utils/getPivotModelIdField'
import { applyWiths } from '../../utils/applyWiths'
import { BulkUpdater } from './BulkUpdater'

export function useFormMaker<
  T extends typeof Model,
> (ModelClass: T, bulkUpdater: BulkUpdater<T>) {
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
    bulkUpdater.fieldKeys.map(field => {
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
    bulkUpdater.belongsToManyRelationshipKeys!.map(field => {
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
        const query = bulkUpdater.repo.query()
        applyWiths(
          ModelClass,
          query,
          toValue(bulkUpdater.indexerWith),
          {
            withoutEntityGlobalScopes: bulkUpdater.options.indexer?.withoutEntityGlobalScopes,
            withoutGlobalScopes: bulkUpdater.options.indexer?.withoutGlobalScopes,
          },
        )
        return query.find(id) as Item<InstanceType<T>>
      }),
      id,
    }

    return defaultMeta
  }

  function addRawForm (id: string, form: PiniaOrmForm<InstanceType<T>>) {
    bulkUpdater.meta.value[id] = makeDefaultMeta(id)
    bulkUpdater.meta.value[id].initialValues = clone(form)
    bulkUpdater.meta.value[id].id = id
    bulkUpdater.meta.value[id].form = bulkUpdater.formsKeyed.value[id]
  }

  function addRawForms (forms: Record<string, PiniaOrmForm<InstanceType<T>>>) {
    Object.entries(forms).forEach(([id, form]) => addRawForm(id, form))
  }

  function makeFromModels (models: Collection<Model>) {
    bulkUpdater.pauseAutoUpdater!()
    for (const model of models) {
      const id = model[bulkUpdater.primaryKeyField as string] as string

      if (!bulkUpdater.formsKeyed.value[id]) {
        bulkUpdater.formsKeyed.value[id] = {}
      }

      bulkUpdater.fieldKeys.forEach(field => {
        if (field !== bulkUpdater.primaryKeyField) {
          let initialFieldValue = model[field]
          if (typeof model[field] === 'object') {
            initialFieldValue = clone(model[field])
          }
          bulkUpdater.formsKeyed.value[id][field] = initialFieldValue

          bulkUpdater.meta.value[id].fields[field] = {
            changed: false,
            updating: false,
            failed: false,
            initialValue: initialFieldValue,
            errors: [],
          }
        }
      })

      bulkUpdater.belongsToManyRelationshipKeys!.forEach((field: keyof FilterPiniaOrmModelToManyRelationshipTypes<InstanceType<T>>) => {
        if (bulkUpdater.pivotClasses[field]) return
        const RelatedModel = bulkUpdater.piniaOrmRelationships[field].related

        const relatedsIds: string[] = []
        model[field]?.forEach((relatedRecord: Model) => {
          const relatedId = bulkUpdater.pivotClasses[field]
            ? relatedRecord[getPivotModelIdField(bulkUpdater.pivotClasses[field], { driver: bulkUpdater.driverKey })]
            : getRecordPrimaryKey(RelatedModel, relatedRecord)
          if (relatedId) relatedsIds.push(relatedId)
        })

        const initialFieldValue = relatedsIds
        bulkUpdater.formsKeyed.value[id][field] = initialFieldValue as any

        bulkUpdater.meta.value[id].fields[field] = {
          changed: false,
          updating: false,
          failed: false,
          errors: [],
          initialValue: initialFieldValue as any,
        }
      })

      if (!bulkUpdater.formWatchers[id]) {
        bulkUpdater.formWatchers[id] = watch(() => bulkUpdater.formsKeyed.value[id], (newValues) => {
          const changedValues = getFormsChangedValues({
            piniaOrmRelationships: bulkUpdater.piniaOrmRelationships,
            id,
            newValues,
            repo: bulkUpdater.repo,
            belongsToManyRelationshipKeys: bulkUpdater.belongsToManyRelationshipKeys,
            pivotClasses: bulkUpdater.pivotClasses,
            driver: bulkUpdater.driverKey,
          })
          const hasChanges = !!Object.values(changedValues).length
          if (hasChanges) {
            bulkUpdater.changes.value[id] = changedValues
          } else {
            delete bulkUpdater.changes.value[id]
          }
          bulkUpdater.meta.value[id].changed = hasChanges
          Object.entries(bulkUpdater.meta.value[id].fields).forEach(changeEntry => {
            const field = changeEntry[0]
            /* @ts-expect-error hard to type, no benefit */
            const formsFieldValue = bulkUpdater.formsKeyed.value[id][field]
            /* @ts-expect-error hard to type, no benefit */
            const initialValue = bulkUpdater.meta.value[id].fields[field].initialValue
            /* @ts-expect-error hard to type, no benefit */
            bulkUpdater.meta.value[id].fields[field].changed = !deepEqual(formsFieldValue, initialValue)
          })
        }, { deep: true })
      }

      bulkUpdater.meta.value[id].initialValues = clone(bulkUpdater.formsKeyed.value[id])
      bulkUpdater.meta.value[id].changed = false

      bulkUpdater.meta.value[id].id = id
      bulkUpdater.meta.value[id].form = bulkUpdater.formsKeyed.value[id]

      // Make forms for related records
      Object.entries(bulkUpdater.withBulkUpdaters!).forEach(([relationshipKey, { composable, isMany }]) => {
        if (isMany) {
          const primaryKeyField = String(composable.ModelClass.primaryKey)

          /** @ts-expect-error hard to type, not worth it */
          if (!bulkUpdater.meta.value[id][relationshipKey + '_forms']) {
          /** @ts-expect-error hard to type, not worth it */
            bulkUpdater.meta.value[id][relationshipKey + '_forms'] = computed(() => {
              return (bulkUpdater.meta.value[id].record as any)?.[relationshipKey]
                ?.map((relatedRecord: any) => {
                  return composable.meta.value?.[relatedRecord[primaryKeyField]] ?? null as BulkUpdateMeta | null
                }) ?? []
            })
          }
        } else {
          const primaryKeyField = String(composable.ModelClass.primaryKey)

          /** @ts-expect-error hard to type, not worth it */
          if (!bulkUpdater.meta.value[id][relationshipKey + '_form']) {
          /** @ts-expect-error hard to type, not worth it */
            bulkUpdater.meta.value[id][relationshipKey + '_form'] = computed(() => {
              const primaryKey = (bulkUpdater.meta.value[id].record as any)[relationshipKey]?.[primaryKeyField]

              return composable.meta.value?.[primaryKey] ?? null as BulkUpdateMeta | null
            })
          }
        }
      })
    }
    nextTick(() => bulkUpdater.resumeAutoUpdater!())
  }

  async function makeForms (
    targetIds?: string[],
  ): Promise<Record<string, PiniaOrmForm<InstanceType<T>>>> {
    const missingModelIds: string[] = []

    if (!targetIds) {
      targetIds = bulkUpdater.repo.all().map(record => record.id)
    }

    for (const targetId of targetIds) {
      if (!bulkUpdater.meta.value[targetId]) {
        bulkUpdater.meta.value[targetId] = makeDefaultMeta(targetId)
      }

      const foundModel = bulkUpdater.indexer.makeQuery({
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
      indexFilters[bulkUpdater.primaryKeyField] = { in: missingModelIds }

      await bulkUpdater.indexer.index({ filters: indexFilters })

      makeFromModels(
        bulkUpdater.indexer.makeQuery().whereId(missingModelIds).get(),
      )
      missingModelIds.forEach(id => {
        bulkUpdater.meta.value[id].makingForm = false
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
