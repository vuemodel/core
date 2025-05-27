import clone from 'just-clone'
import { Collection, Item, Model } from 'pinia-orm'
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
import { makeChannel } from '../../broadcasting/makeChannel'
import { OnCreatePersistMessage, OnDestroyPersistMessage } from '../../broadcasting/BroadcastMessages'
import remove from 'just-remove'
import { Form } from '../../types/Form'

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

  const defaultHasManyMetas = Object.fromEntries<{
    changed: boolean
    changes: BulkUpdateForm<InstanceType<T>>
    updating: boolean
    failed: boolean
    initialValue: any
    errors: string[]
  }>(
    bulkUpdater.hasManyRelationshipKeys!.map(field => {
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
      changes: computed(() => {
        if (bulkUpdater.changes.value) {
          return bulkUpdater.changes.value
        }
        return {} as BulkUpdateForm<InstanceType<T>>
      }),
      standardErrors: [],
      validationErrors: {},
      fields: {
        ...defaultFieldMetas,
        ...defaultBelongsToManyMetas,
        ...defaultHasManyMetas,
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

  function addRawForm (id: string, form: Form<InstanceType<T>>) {
    bulkUpdater.meta.value[id] = makeDefaultMeta(id)
    bulkUpdater.meta.value[id].initialValues = clone(form)
    bulkUpdater.meta.value[id].id = id
    bulkUpdater.meta.value[id].form = bulkUpdater.formsKeyed.value[id]
  }

  function addRawForms (forms: Record<string, Form<InstanceType<T>>>): void {
    Object.entries(forms).forEach(([id, form]) => addRawForm(id, form))
  }

  function makeFromModels (models: Collection<Model>): void {
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

      // Belongs to many
      bulkUpdater.belongsToManyRelationshipKeys.forEach((field: keyof FilterPiniaOrmModelToManyRelationshipTypes<InstanceType<T>>) => {
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

      // Has Many
      bulkUpdater.hasManyRelationshipKeys.forEach((field: keyof FilterPiniaOrmModelToManyRelationshipTypes<InstanceType<T>>) => {
        const relationshipDetails = bulkUpdater.piniaOrmRelationships[field]
        const RelatedModel = relationshipDetails.related
        const foreignKey = relationshipDetails.foreignKey

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

        // TODO: should be using hooks here, NOT broadcasting channels
        const hasManyCreateChannel = makeChannel('createPersist', RelatedModel)
        const hasManyDestroyChannel = makeChannel('destroyPersist', RelatedModel)
        hasManyCreateChannel.onmessage = (event) => {
          const { response } = event.data as OnCreatePersistMessage<T>
          const relatedId = getRecordPrimaryKey(RelatedModel, response.record)
          // User Form
          const form = bulkUpdater.formsKeyed.value[id]

          if (id === response.record[foreignKey]) {
            if (!form[field].includes(relatedId)) {
              form[field].push(relatedId)
            }
          }
        }
        hasManyDestroyChannel.onmessage = (event) => {
          const { response } = event.data as OnDestroyPersistMessage<T>
          // Post ID
          const relatedId = getRecordPrimaryKey(RelatedModel, response.record)
          // User Form
          const form = bulkUpdater.formsKeyed.value[id]
          // if user.id === post.user_id
          if (id === response.record[foreignKey]) {
            // Index of the post
            const recordIndex = form[field].indexOf(relatedId)
            if (recordIndex > -1) {
              // Remove the post id from userForm.posts
              form[field].splice(recordIndex, 1)
            }
          }
        }

        bulkUpdater.hasManyIdWatchers[id] = watch(() => bulkUpdater.formsKeyed.value[id]?.[field], (hasManyIds) => {
          if (!Array.isArray(hasManyIds)) return

          for (const formDetails of bulkUpdater.forms.value) {
            if (id === formDetails.id) continue
            const relatedContainsIdsForRemoval = formDetails.form[field]?.some(relatedId => {
              return hasManyIds.includes(relatedId)
            })
            if (!relatedContainsIdsForRemoval) continue

            formDetails.form[field] = remove(formDetails.form[field], hasManyIds)
          }
        })
      })

      if (!bulkUpdater.formWatchers[id]) {
        bulkUpdater.formWatchers[id] = watch(() => bulkUpdater.formsKeyed.value[id], (newValues) => {
          const changedValues = getFormsChangedValues({
            piniaOrmRelationships: bulkUpdater.piniaOrmRelationships,
            id,
            newValues,
            repo: bulkUpdater.repo,
            belongsToManyRelationshipKeys: bulkUpdater.belongsToManyRelationshipKeys,
            hasManyRelationshipKeys: bulkUpdater.hasManyRelationshipKeys,
            pivotClasses: bulkUpdater.pivotClasses,
            driver: bulkUpdater.driverKey,
            // formsKeyed: bulkUpdater.formsKeyed,
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
  ): Promise<Record<string, Form<InstanceType<T>>>> {
    const missingModelIds: string[] = []

    if (!targetIds) {
      targetIds = bulkUpdater.repo.all().map(record => record.id)
    }

    const foundModels: InstanceType<T>[] = []
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
        foundModels.push(foundModel)
      }
    }
    if (foundModels.length) makeFromModels(foundModels)

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
