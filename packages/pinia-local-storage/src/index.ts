import {
  VueModelDriverConfig,
  useCreatorDriver,
  useUpdaterDriver,
  useIndexerDriver,
  useFinderDriver,
  useDestroyerDriver,
  useBatchUpdaterDriver,
} from '@vuemodel/core'

import { index } from './drivers/index/index'
import { create } from './drivers/create/create'
import { find } from './drivers/find/find'
import { destroy } from './drivers/destroy/destroy'
import { update } from './drivers/update/update'
import { batchUpdate } from './drivers/batch-update/batchUpdate'
import { sync } from './drivers/sync/sync'
import features from './features.json'

export const piniaLocalVueModelDriver: VueModelDriverConfig['driver'] = {
  index,
  useIndexer: useIndexerDriver,

  create,
  useCreator: useCreatorDriver,

  update,
  useUpdater: useUpdaterDriver,

  find,
  useFinder: useFinderDriver,

  destroy,
  useDestroyer: useDestroyerDriver,

  batchUpdate,
  useBatchUpdater: useBatchUpdaterDriver,

  sync,

  features,
}

export {
  index,
  create,
  update,
  find,
  destroy,
}

export { createIndexedDbRepo } from './utils/createIndexedDbRepo'
export { deleteDatabases } from './utils/deleteDatabases'

export { createPiniaLocalStorage } from './plugin/createPiniaLocalStorage'
export * from './plugin/state'
