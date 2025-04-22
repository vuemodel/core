import { Model } from 'pinia-orm'
import { getRecordPrimaryKey } from '../../utils/getRecordPrimaryKey'
import { OnCreatePersistMessage, OnDestroyPersistMessage, OnFindPersistMessage, OnIndexPersistMessage, OnUpdatePersistMessage } from '../../broadcasting/BroadcastMessages'
import { getCurrentScope, onScopeDispose, toValue, watch } from 'vue'
import { makeChannel } from '../../broadcasting/makeChannel'
import { BulkUpdater } from './BulkUpdater'

export function useFormSyncer<
  T extends typeof Model,
> (bulkUpdater: BulkUpdater<T>) {
  function indexedSyncHandler (event: MessageEvent<any>) {
    const { entity, response, _useIndexerOptions } = event.data as OnIndexPersistMessage<T>

    if (
      entity !== bulkUpdater.ModelClass.entity ||
      _useIndexerOptions.composableId === bulkUpdater.indexer.composableId
    ) return

    const recordPrimaryKeys: string[] = []
    response.records?.forEach(record => {
      const primaryKey = getRecordPrimaryKey(bulkUpdater.ModelClass, record)
      if (typeof primaryKey === 'string') recordPrimaryKeys.push(primaryKey)
    })

    if (recordPrimaryKeys.length) {
      bulkUpdater.formMaker.makeForms(recordPrimaryKeys)
    }
  }

  function createdSyncHandler (event: MessageEvent<any>) {
    const { entity, response } = event.data as OnCreatePersistMessage<T>
    if (entity !== bulkUpdater.ModelClass.entity || !response.record) return
    const recordPrimaryKey = getRecordPrimaryKey(bulkUpdater.ModelClass, response.record)
    if (recordPrimaryKey) {
      bulkUpdater.formMaker.makeForms([recordPrimaryKey])
    }
  }

  function foundSyncHandler (event: MessageEvent<any>) {
    const { entity, response } = event.data as OnFindPersistMessage<T>
    if (entity !== bulkUpdater.ModelClass.entity || !response.record) return
    const recordPrimaryKey = getRecordPrimaryKey(bulkUpdater.ModelClass, response.record)
    if (recordPrimaryKey) {
      bulkUpdater.formMaker.makeForms([recordPrimaryKey])
    }
  }

  function updatedSyncHandler (event: MessageEvent<any>) {
    const { entity, response } = event.data as OnUpdatePersistMessage<T>
    if (entity !== bulkUpdater.ModelClass.entity || !response.record) return
    const recordPrimaryKey = getRecordPrimaryKey(bulkUpdater.ModelClass, response.record)
    if (recordPrimaryKey) {
      bulkUpdater.formMaker.makeForms([recordPrimaryKey])
    }
  }

  function destroyedSyncHandler (event: MessageEvent<any>) {
    const { entity, response } = event.data as OnDestroyPersistMessage<T>
    if (entity !== bulkUpdater.ModelClass.entity || !response.record) return
    const recordPrimaryKey = getRecordPrimaryKey(bulkUpdater.ModelClass, response.record)
    if (recordPrimaryKey) {
      bulkUpdater.removeForm(recordPrimaryKey)
    }
  }

  const channels = {
    indexed: {
      channel: makeChannel('indexPersist', bulkUpdater.ModelClass),
      handler: indexedSyncHandler,
    },
    created: {
      channel: makeChannel('createPersist', bulkUpdater.ModelClass),
      handler: createdSyncHandler,
    },
    found: {
      channel: makeChannel('findPersist', bulkUpdater.ModelClass),
      handler: foundSyncHandler,
    },
    updated: {
      channel: makeChannel('updatePersist', bulkUpdater.ModelClass),
      handler: updatedSyncHandler,
    },
    destroyed: {
      channel: makeChannel('destroyPersist', bulkUpdater.ModelClass),
      handler: destroyedSyncHandler,
    },
  }

  watch(() => toValue(bulkUpdater.options.syncOn), (newSyncOn) => {
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
