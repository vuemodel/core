import { Model } from 'pinia-orm'
import { getRecordPrimaryKey } from '../../utils/getRecordPrimaryKey'
import { makeChannel } from '../../utils/makeChannel'
import { UseBatchUpdaterOptions, UseBatchUpdaterReturn } from '../../contracts/batch-update/UseBatchUpdater'
import { OnCreatedMessage, OnDestroyedMessage, OnFoundMessage, OnIndexedMessage, OnUpdatedMessage } from '../../types/BroadcastMessages'
import { onBeforeUnmount, toValue, watch } from 'vue'
import { UseIndexerReturn } from '../../contracts/crud/index/UseIndexer'

export function useFormSyncer<
  T extends typeof Model,
  R extends UseBatchUpdaterReturn<T>
> (options: {
  ModelClass: T
  makeForms: R['makeForms']
  removeForm: R['removeForm']
  syncOn: UseBatchUpdaterOptions<T>['syncOn']
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
    const { entity, response, _useIndexerOptions } = event.data as OnIndexedMessage<T>

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
    const { entity, response } = event.data as OnCreatedMessage<T>
    if (entity !== ModelClass.entity || !response.record) return
    const recordPrimaryKey = getRecordPrimaryKey(ModelClass, response.record)
    if (recordPrimaryKey) {
      makeForms([recordPrimaryKey])
    }
  }

  function foundSyncHandler (event: MessageEvent<any>) {
    const { entity, response } = event.data as OnFoundMessage<T>
    if (entity !== ModelClass.entity || !response.record) return
    const recordPrimaryKey = getRecordPrimaryKey(ModelClass, response.record)
    if (recordPrimaryKey) {
      makeForms([recordPrimaryKey])
    }
  }

  function updatedSyncHandler (event: MessageEvent<any>) {
    const { entity, response } = event.data as OnUpdatedMessage<T>
    if (entity !== ModelClass.entity || !response.record) return
    const recordPrimaryKey = getRecordPrimaryKey(ModelClass, response.record)
    if (recordPrimaryKey) {
      makeForms([recordPrimaryKey])
    }
  }

  function destroyedSyncHandler (event: MessageEvent<any>) {
    const { entity, response } = event.data as OnDestroyedMessage<T>
    if (entity !== ModelClass.entity || !response.record) return
    const recordPrimaryKey = getRecordPrimaryKey(ModelClass, response.record)
    if (recordPrimaryKey) {
      removeForm(recordPrimaryKey)
    }
  }

  const channels = {
    indexed: {
      channel: makeChannel('indexed', ModelClass),
      handler: indexedSyncHandler,
    },
    created: {
      channel: makeChannel('created', ModelClass),
      handler: createdSyncHandler,
    },
    found: {
      channel: makeChannel('found', ModelClass),
      handler: foundSyncHandler,
    },
    updated: {
      channel: makeChannel('updated', ModelClass),
      handler: updatedSyncHandler,
    },
    destroyed: {
      channel: makeChannel('destroyed', ModelClass),
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

  onBeforeUnmount(() => {
    Object.values(channels).forEach(channel => channel.channel.close())
  })

  return {
    //
  }
}
