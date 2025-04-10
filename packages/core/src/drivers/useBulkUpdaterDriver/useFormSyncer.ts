import { Model } from 'pinia-orm'
import { getRecordPrimaryKey } from '../../utils/getRecordPrimaryKey'
import { UseBulkUpdaterOptions, UseBulkUpdaterReturn } from '../../contracts/bulk-update/UseBulkUpdater'
import { OnCreatePersistMessage, OnDestroyPersistMessage, OnFindPersistMessage, OnIndexPersistMessage, OnUpdatePersistMessage } from '../../broadcasting/BroadcastMessages'
import { getCurrentScope, onScopeDispose, toValue, watch } from 'vue'
import { UseIndexerReturn } from '../../contracts/crud/index/UseIndexer'
import { makeChannel } from '../../broadcasting/makeChannel'

export function useFormSyncer<
  T extends typeof Model,
  R extends UseBulkUpdaterReturn<T>
> (options: {
  ModelClass: T
  makeForms: R['makeForms']
  removeForm: R['removeForm']
  syncOn: UseBulkUpdaterOptions<T>['syncOn']
  indexer: UseIndexerReturn<T>
}) {
  const {
    makeForms,
    ModelClass,
    removeForm,
    syncOn,
    indexer,
  } = options

  function indexedSyncHandler (event: MessageEvent<any>) {
    const { entity, response, _useIndexerOptions } = event.data as OnIndexPersistMessage<T>

    if (
      entity !== ModelClass.entity ||
      _useIndexerOptions.composableId === indexer.composableId
    ) return

    const recordPrimaryKeys: string[] = []
    response.records?.forEach(record => {
      const primaryKey = getRecordPrimaryKey(ModelClass, record)
      if (typeof primaryKey === 'string') recordPrimaryKeys.push(primaryKey)
    })

    if (recordPrimaryKeys.length) {
      makeForms(recordPrimaryKeys)
    }
  }

  function createdSyncHandler (event: MessageEvent<any>) {
    const { entity, response } = event.data as OnCreatePersistMessage<T>
    if (entity !== ModelClass.entity || !response.record) return
    const recordPrimaryKey = getRecordPrimaryKey(ModelClass, response.record)
    if (recordPrimaryKey) {
      makeForms([recordPrimaryKey])
    }
  }

  function foundSyncHandler (event: MessageEvent<any>) {
    const { entity, response } = event.data as OnFindPersistMessage<T>
    if (entity !== ModelClass.entity || !response.record) return
    const recordPrimaryKey = getRecordPrimaryKey(ModelClass, response.record)
    if (recordPrimaryKey) {
      makeForms([recordPrimaryKey])
    }
  }

  function updatedSyncHandler (event: MessageEvent<any>) {
    const { entity, response } = event.data as OnUpdatePersistMessage<T>
    if (entity !== ModelClass.entity || !response.record) return
    const recordPrimaryKey = getRecordPrimaryKey(ModelClass, response.record)
    if (recordPrimaryKey) {
      makeForms([recordPrimaryKey])
    }
  }

  function destroyedSyncHandler (event: MessageEvent<any>) {
    const { entity, response } = event.data as OnDestroyPersistMessage<T>
    if (entity !== ModelClass.entity || !response.record) return
    const recordPrimaryKey = getRecordPrimaryKey(ModelClass, response.record)
    if (recordPrimaryKey) {
      removeForm(recordPrimaryKey)
    }
  }

  const channels = {
    indexed: {
      channel: makeChannel('indexPersist', ModelClass),
      handler: indexedSyncHandler,
    },
    created: {
      channel: makeChannel('createPersist', ModelClass),
      handler: createdSyncHandler,
    },
    found: {
      channel: makeChannel('findPersist', ModelClass),
      handler: foundSyncHandler,
    },
    updated: {
      channel: makeChannel('updatePersist', ModelClass),
      handler: updatedSyncHandler,
    },
    destroyed: {
      channel: makeChannel('destroyPersist', ModelClass),
      handler: destroyedSyncHandler,
    },
  }

  watch(() => toValue(syncOn), (newSyncOn) => {
    const syncOnResolved: { [key in keyof typeof channels]?: boolean } = newSyncOn ?? {}
    Object.entries(syncOnResolved).forEach(([eventName, enabled]) => {
      const channel = channels[eventName as keyof typeof channels]
      channel.channel.onmessage = enabled ? channel.handler : null
    })
  }, { immediate: true })

  if (getCurrentScope()) {
    onScopeDispose(() => {
      Object.values(channels).forEach(channel => channel.channel.close())
    }, true)
  }

  return {
    //
  }
}
