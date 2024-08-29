import { Model } from 'pinia-orm'
import { getDriverKey } from './getDriverKey'
import { BroadcastMap } from '../types/BroadcastMessages'

export type VueModelChannel =
  'creating' | 'created' |
  'updating' | 'updated' |
  'indexing' | 'indexed' |
  'finding' | 'found' |
  'destroying' | 'destroyed' |
  'batchUpdating' | 'batchUpdated'

// (`vuemodel.${driverKey}.creating`)
// (`vuemodel.${driverKey}.created`)
// (`vuemodel.${driverKey}.${entity}.creating`)
// (`vuemodel.${driverKey}.${entity}.created`)

export interface MakeChannelOptions {
  driver?: string
}

export function getChannelPrefix () {
  return 'vuemodel'
}

export function makeChannel<T extends typeof Model> (
  channelName: VueModelChannel,
  ModelClassOrOptions?: T | MakeChannelOptions,
  options?: MakeChannelOptions,
) {
  const params: { ModelClass?: T, options: { driver?: string } | undefined } = {
    options: {},
  }

  if (!!ModelClassOrOptions && ModelClassOrOptions instanceof Model) {
    params.ModelClass = ModelClassOrOptions as T
    params.options = options ?? {}
  }

  const channel = [getChannelPrefix(), getDriverKey()]

  const ModelClassResolved = params.ModelClass
  if (ModelClassResolved) {
    channel.push(ModelClassResolved.entity)
  }
  channel.push(channelName)

  return new BroadcastChannel(channel.join('.'))
}

// (`vuemodel.${driverKey}.creating`)
export function onModel<T extends keyof BroadcastMap> (
  channelName: T,
  callback: (message: BroadcastMap[T], event: MessageEvent<BroadcastMap[T]>) => void,
  options?: { driver: string },
) {
  const channel = makeChannel(channelName, options)
  channel.onmessage = (evt) => {
    callback(evt.data, evt)
  }

  return channel
}
