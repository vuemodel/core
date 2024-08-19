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

export const orionVueModelDriver: VueModelDriver['implementation'] = {
  features,

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
}

export {
  index,
  create,
  update,
  find,
  destroy,
}

export { createOrion } from './plugin/createOrion'
export * from './plugin/state'
export * from './extensions/AddScopeTypes'
