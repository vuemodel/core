import { getDriverFunction } from '../getDriverFunction'
import { Model } from 'pinia-orm'
import { SyncResponse } from '../types/Response'
import { resolveSyncParams } from './resolveSyncParams'
import clone from 'just-clone'
import { OnSyncingMessage, OnSyncedMessage } from '../types/BroadcastMessages'
import { Sync, SyncOptions } from '../contracts/sync/Sync'
import { FilterPiniaOrmModelToManyRelationshipTypes } from '../types/FilterPiniaOrmModelToManyRelationshipTypes'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'

export function sync<T extends typeof Model>(
  ModelClass: T, // When a Model class is passed, use this signature
  id: LoosePrimaryKey,
  related: keyof FilterPiniaOrmModelToManyRelationshipTypes<InstanceType<T>>,
  forms: string[] | number[] | Record<string, any>,
  options?: SyncOptions<T>,
): Promise<SyncResponse<T>>;

export function sync<T extends typeof Model>(
  driver: string, // When a driver string is passed, we expect this signature
  ModelClass: T,
  id: LoosePrimaryKey,
  related: keyof FilterPiniaOrmModelToManyRelationshipTypes<InstanceType<T>>,
  forms: string[] | number[] | Record<string, any>,
  options?: SyncOptions<T>,
): Promise<SyncResponse<T>>;

export function sync<T extends typeof Model> (
  driverOrModelClass: string | T,
  modelClassOrId: T | LoosePrimaryKey,
  idOrRelated: LoosePrimaryKey | keyof FilterPiniaOrmModelToManyRelationshipTypes<InstanceType<T>>,
  relatedOrForm: string[] | number[] | Record<string, DeclassifyPiniaOrmModel<InstanceType<T>>> | keyof FilterPiniaOrmModelToManyRelationshipTypes<InstanceType<T>>,
  formOrOptions?: string[] | number[] | Record<string, DeclassifyPiniaOrmModel<InstanceType<T>>> | SyncOptions<T>,
  options?: SyncOptions<T>,
): Promise<SyncResponse<T>> {
  const params = resolveSyncParams<T>(
    driverOrModelClass,
    modelClassOrId,
    idOrRelated,
    relatedOrForm,
    formOrOptions,
    options,
  )
  const driverKey = typeof params.ModelClass === 'string' ? params.ModelClass : params.options?.driver

  const driver = getDriverFunction('sync', driverKey) as Sync<T>

  const entity = params.ModelClass.entity

  const syncingChannel = new BroadcastChannel(`vuemodel.${driverKey}.syncing`)
  const syncedChannel = new BroadcastChannel(`vuemodel.${driverKey}.synced`)
  const syncingEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.syncing`)
  const syncedEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.synced`)

  const keyValueForm = Array.isArray(params.forms)
    ? Object.fromEntries(params.forms.map(id => [id, {}])) as Record<string, DeclassifyPiniaOrmModel<InstanceType<T>>>
    : params.forms

  const syncingPostMessage: OnSyncingMessage = clone({
    entity: params.ModelClass.entity,
    related: params.related,
    forms: keyValueForm,
  })

  syncingChannel.postMessage(syncingPostMessage)
  syncingEntityChannel.postMessage(syncingPostMessage)

  return driver(
    params.ModelClass,
    params.id,
    params.related,
    keyValueForm,
    params.options,
  ).then(response => {
    const syncedPostMessage: OnSyncedMessage<T> = clone({
      entity,
      related: params.related,
      response,
    })
    syncedChannel.postMessage(syncedPostMessage)
    syncedEntityChannel.postMessage(syncedPostMessage)
    return response
  })
}
