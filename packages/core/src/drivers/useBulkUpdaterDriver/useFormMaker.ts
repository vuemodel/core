import clone from 'just-clone'
import { Collection, Model } from 'pinia-orm'
import { FilterPiniaOrmModelToFieldTypes, FilterPiniaOrmModelToRelationshipTypes, getClassRelationships, PiniaOrmForm } from 'pinia-orm-helpers'
import { nextTick, watch, WatchStopHandle } from 'vue'
import { BulkUpdateForm, BulkUpdateMeta, UseBulkUpdaterReturn } from '../../contracts/bulk-update/UseBulkUpdater'
import { getFormsChangedValues } from './getFormsChangedValues'
import deepEqual from 'deep-equal'
import { IndexFilters } from '../../contracts/crud/index/IndexFilters'
import { getRecordPrimaryKey } from '../../utils/getRecordPrimaryKey'
import { FilterPiniaOrmModelToManyRelationshipTypes } from '../../types/FilterPiniaOrmModelToManyRelationshipTypes'
import { getPivotModelIdField } from '../../utils/getPivotModelIdField'

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
    pauseAutoUpdater: () => void
    resumeAutoUpdater: () => void
    primaryKeyField: string | string[]
    forms: R['forms']
    fieldKeys: (keyof FilterPiniaOrmModelToFieldTypes<InstanceType<T>>)[]
    meta: R['meta']
    formWatchers: Record<string, WatchStopHandle>
    indexer: R['indexer']
    pivotClasses: Record<string, Model>
    driver: string
  },
) {
  const {
    forms,
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
  } = options

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

  const defaultMeta: BulkUpdateMeta<T> = {
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
  }

  function addRawForm (id: string, form: PiniaOrmForm<InstanceType<T>>) {
    meta.value[id] = structuredClone(defaultMeta)
    meta.value[id].initialValues = clone(form)
  }

  function addRawForms (forms: Record<string, PiniaOrmForm<InstanceType<T>>>) {
    Object.entries(forms).forEach(([id, form]) => addRawForm(id, form))
  }

  function makeFromModels (models: Collection<Model>) {
    pauseAutoUpdater()
    for (const model of models) {
      const id = model[primaryKeyField as string] as string

      if (!forms.value[id]) {
        forms.value[id] = {}
      }

      fieldKeys.forEach(field => {
        if (field !== primaryKeyField) {
          let initialFieldValue = model[field]
          if (typeof model[field] === 'object') {
            initialFieldValue = clone(model[field])
          }
          forms.value[id][field] = initialFieldValue

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
        forms.value[id][field] = initialFieldValue as any

        meta.value[id].fields[field] = {
          changed: false,
          updating: false,
          failed: false,
          errors: [],
          initialValue: initialFieldValue as any,
        }
      })

      if (!formWatchers[id]) {
        formWatchers[id] = watch(() => forms.value[id], (newValues) => {
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
            const formsFieldValue = forms.value[id][field]
            /* @ts-expect-error hard to type, no benefit */
            const initialValue = meta.value[id].fields[field].initialValue
            /* @ts-expect-error hard to type, no benefit */
            meta.value[id].fields[field].changed = !deepEqual(formsFieldValue, initialValue)
          })
        }, { deep: true })
      }

      meta.value[id].initialValues = clone(forms.value[id])
      meta.value[id].changed = false
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
        meta.value[targetId] = structuredClone(defaultMeta)
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
      // missingModelIds.forEach(id => {
      //   meta.value[id] = structuredClone(defaultMeta)
      // })

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
