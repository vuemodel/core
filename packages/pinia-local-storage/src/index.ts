import {
  VueModelDriver,
  useCreatorImplementation,
  useUpdaterImplementation,
  useIndexerImplementation,
  useFinderImplementation,
  useDestroyerImplementation,
} from '@vuemodel/core'

import { index } from './implementations/index/index'
import { create } from './implementations/create/create'
import { find } from './implementations/find/find'
import { destroy } from './implementations/destroy/destroy'
import { update } from './implementations/update/update'
import features from './features.json'

export const piniaLocalVueModelDriver: VueModelDriver['implementation'] = {
  index,
  useIndexer: useIndexerImplementation,

  create,
  useCreator: useCreatorImplementation,

  update,
  useUpdater: useUpdaterImplementation,

  find,
  useFinder: useFinderImplementation,

  destroy,
  useDestroyer: useDestroyerImplementation,

  features,
}

export {
  index,
  create,
  update,
  find,
  destroy,
}

export { createPiniaLocalStorage } from './plugin/createPiniaLocalStorage'
export * from './plugin/state'
