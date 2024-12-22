import {
  useCreatorDriver,
  useUpdaterDriver,
  useIndexerDriver,
  useFinderDriver,
  useDestroyerDriver,
  useBulkUpdaterDriver,
  VueModelDriverConfig,
} from '@vuemodel/core'

import { index } from './drivers/index/index'
import { create } from './drivers/create/create'
import { find } from './drivers/find/find'
import { destroy } from './drivers/destroy/destroy'
import { update } from './drivers/update/update'
import features from './features.json'
import { bulkUpdate } from './drivers/bulk-update/bulkUpdate'
import { sync } from './drivers/sync/sync'

export const orionVueModelDriver: VueModelDriverConfig['driver'] = {
  features,

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
