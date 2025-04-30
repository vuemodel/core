import { Model } from 'pinia-orm'
import { BroadcastMap, OnBulkUpdatedMessage, OnBulkUpdatePersistMessage, OnBulkUpdatingMessage, OnCreatedMessage, OnCreateOptimisticPersistMessage, OnCreatePersistMessage, OnCreatingMessage, OnDestroyedMessage, OnDestroyingMessage, OnDestroyOptimisticPersistMessage, OnDestroyPersistMessage, OnFindingMessage, OnFindPersistMessage, OnFoundMessage, OnIndexedMessage, OnIndexingMessage, OnIndexPersistMessage, OnSyncedMessage, OnSyncingMessage, OnSyncPersistMessage, OnUpdatedMessage, OnUpdateOptimisticPersistMessage, OnUpdatePersistMessage, OnUpdatingMessage } from './BroadcastMessages'
import { getDriverKey } from '../utils/getDriverKey'

export type VueModelChannel = keyof BroadcastMap

export interface MakeChannelOptions {
  driver?: string
}

export function getChannelPrefix () {
  return 'vuemodel'
}

export function makeChannel<T extends typeof Model> (
  channelName: VueModelChannel,
  ModelClassOrOptions?: T | InstanceType<T> | MakeChannelOptions,
  options?: MakeChannelOptions,
): BroadcastChannel {
  const params: { ModelClass?: any, options: { driver?: string } | undefined } = {
    options: {},
  }

  if ((ModelClassOrOptions as any)?.entity || (ModelClassOrOptions as any)?.$entity()) {
    params.ModelClass = ModelClassOrOptions
    params.options = options ?? {}
  }

  const channel = [getChannelPrefix(), getDriverKey()]

  const ModelClassResolved = params.ModelClass
  if (ModelClassResolved) {
    channel.push(ModelClassResolved.entity ?? ModelClassResolved.$entity())
  }
  channel.push(channelName)

  return new BroadcastChannel(channel.join('.'))
}

export function onModel<T extends keyof BroadcastMap> (
  channelName: T,
  callback: (message: BroadcastMap[T], event: MessageEvent<BroadcastMap[T]>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel(channelName, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onCreating<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnCreatingMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('creating', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onCreated<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnCreatedMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('created', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onCreateOptimisticPersist<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnCreateOptimisticPersistMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('createOptimisticPersist', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onCreatePersist<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnCreatePersistMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('createPersist', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onUpdating<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnUpdatingMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('updating', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onUpdated<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnUpdatedMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('updated', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onUpdateOptimisticPersist<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnUpdateOptimisticPersistMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('updateOptimisticPersist', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onUpdatePersist<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnUpdatePersistMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('updatePersist', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onIndexing<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnIndexingMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('indexing', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onIndexed<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnIndexedMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('indexed', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onIndexPersist<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnIndexPersistMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('indexPersist', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onFinding<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnFindingMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('finding', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onFound<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnFoundMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('found', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onFindPersist<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnFindPersistMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('findPersist', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onDestroying<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnDestroyingMessage, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('destroying', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onDestroyed<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnDestroyedMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('destroyed', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onDestroyOptimisticPersist<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnDestroyOptimisticPersistMessage, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('destroyOptimisticPersist', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onDestroyPersist<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnDestroyPersistMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('destroyPersist', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onBulkUpdating<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnBulkUpdatingMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('bulkUpdating', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onBulkUpdated<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnBulkUpdatedMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('bulkUpdated', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onBulkUpdatePersist<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnBulkUpdatePersistMessage<T>, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('bulkUpdatePersist', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onSyncing<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnSyncingMessage, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('syncing', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onSynced<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnSyncedMessage, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('synced', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}

export function onSyncPersist<T extends typeof Model> (
  ModelClass: T,
  callback: (message: OnSyncPersistMessage, event: MessageEvent<T>) => void,
  options?: { driver: string },
): BroadcastChannel {
  const channel = makeChannel('syncPersist', ModelClass, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}
