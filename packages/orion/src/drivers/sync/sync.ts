import { FilterPiniaOrmModelToManyRelationshipTypes, SyncOptions, SyncResponse, getMergedDriverConfig, vueModelState, UseBulkUpdateFormValidationErrors, getClassRelationships, RelationshipDefinition } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { LoosePrimaryKey } from '@vuemodel/core/src/types/LoosePrimaryKey'
import { OrionDriverOptions, orionState } from '../../plugin/state'

export async function sync<T extends typeof Model> (
  ModelClass: T, // When a Model class is passed, use this signature
  id: LoosePrimaryKey,
  related: keyof FilterPiniaOrmModelToManyRelationshipTypes<InstanceType<T>>,
  forms: string[] | number[] | Record<string, any>,
  options: SyncOptions<T> = {},
): Promise<SyncResponse<T>> {
  return new Promise(async (resolve, reject) => {
    const vueModelDefaultDriverKey = typeof vueModelState.default === 'function' ? vueModelState.default() : vueModelState.default
    const driverOptions = orionState[options?.driver ?? vueModelDefaultDriverKey ?? 'default'] as OrionDriverOptions
    const config = getMergedDriverConfig(options?.driver)
    const optionsMerged = Object.assign(
      {},
      config,
      options,
    )

    const primaryKeyField = String(ModelClass instanceof Model ? ModelClass.$primaryKey() : ModelClass.primaryKey)
    const relationshipInfo = getClassRelationships(ModelClass)[related] as RelationshipDefinition
    const foreignPivotKey = relationshipInfo.foreignPivotKey as string
    const relatedPivotKey = relationshipInfo.relatedPivotKey as string
    const foreignId = String(id)

    const errorReturnFunction = optionsMerged.throw ? reject : resolve

    if (options.signal?.aborted) {
      return errorReturnFunction({
        standardErrors: [{
          name: 'aborted',
          message: options.signal.reason?.message ?? options.signal.reason ?? 'The operation was aborted.',
        }],
        action: 'sync',
        success: false,
        validationErrors: {} as UseBulkUpdateFormValidationErrors<InstanceType<T>>,
        entity: ModelClass.entity,
        attached: undefined,
        detached: undefined,
        updated: undefined,
      })
    }

    options.signal?.addEventListener('abort', () => {
      return errorReturnFunction({
        standardErrors: [{
          name: 'aborted',
          message: options.signal?.reason?.message ?? options.signal?.reason ?? 'The operation was aborted.',
        }],
        action: 'sync',
        success: false,
        validationErrors: {} as UseBulkUpdateFormValidationErrors<InstanceType<T>>,
        entity: ModelClass.entity,
        attached: undefined,
        detached: undefined,
        updated: undefined,
      })
    })
    const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.sync

    const idResolved = Array.isArray(id) ? JSON.stringify(id) : id

    const requestData = { resources: forms }
    const wretch = await driverOptions.createWretch({
      data: requestData,
      primaryKey: String(idResolved),
    })

    type OrionSyncIds = string[] | number[]
    type OrionSyncResponse = {
      attached: OrionSyncIds
      detached: OrionSyncIds
      updated: OrionSyncIds
    }

    try {
      const response = await wretch.url(`/${ModelClass.entity}/${idResolved}/${related}/sync`)
        .patch(requestData)
        .json() as OrionSyncResponse

      const attached = response.attached.map((attachedId) => {
        return {
          [foreignPivotKey]: foreignId,
          [relatedPivotKey]: attachedId,
          ...((forms as any)?.[attachedId] ?? {}),
        }
      })

      const detached = response.detached.map((detachedId) => {
        return {
          [foreignPivotKey]: foreignId,
          [relatedPivotKey]: detachedId,
          ...((forms as any)?.[detachedId] ?? {}),
        }
      })

      const updated = response.updated.map((updatedId) => {
        return {
          [foreignPivotKey]: foreignId,
          [relatedPivotKey]: updatedId,
          ...((forms as any)?.[updatedId] ?? {}),
        }
      })

      const result: SyncResponse<T> = {
        action: 'sync',
        standardErrors: undefined,
        attached,
        detached,
        updated,
        success: true,
        entity: ModelClass.entity,
      }

      return resolve(result)
    } catch (err: any) {
      const result: SyncResponse<T> = {
        standardErrors: [],
        validationErrors: {} as UseBulkUpdateFormValidationErrors<InstanceType<T>>,
        success: false,
        action: 'sync',
        attached: undefined,
        detached: undefined,
        updated: undefined,
        entity: ModelClass.entity,
      }

      result.standardErrors = [
        {
          message: err?.message ?? 'unknown',
          httpStatus: err.status,
          name: err?.message ?? 'unknown',
          details: err,
        },
      ]

      if (typeof err?.json?.errors === 'object') {
        result.validationErrors = err.json.errors
      }

      if (notifyOnError) {
        optionsMerged.errorNotifiers?.sync?.({
          model: ModelClass,
          errors: {
            standardErrors: result.standardErrors,
            validationErrors: result.validationErrors ?? {} as any,
          },
        })
      }

      return errorReturnFunction(result)
    }
  })
}
