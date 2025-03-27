import {
  VueModelDriverConfig,
  useCreatorDriver,
  useUpdaterDriver,
  useIndexerDriver,
  useFinderDriver,
  useDestroyerDriver,
  useBulkUpdaterDriver,
} from '@vuemodel/core'

import { index } from './drivers/index/index'
import { create } from './drivers/create/create'
import { find } from './drivers/find/find'
import { destroy } from './drivers/destroy/destroy'
import { update } from './drivers/update/update'
import { bulkUpdate } from './drivers/bulk-update/bulkUpdate'
import { sync } from './drivers/sync/sync'
import features from './features.json'

export const indexedDbVueModelDriver: VueModelDriverConfig['driver'] = {
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

  bulkUpdate,
  useBulkUpdater: useBulkUpdaterDriver,

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

export { createIndexedDb } from './plugin/createIndexedDb'
export * from './plugin/state'
