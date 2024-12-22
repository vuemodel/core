import { Model } from 'pinia-orm'
import { Index } from './crud/index/Index'
import { UseIndexer } from './crud/index/UseIndexer'
import { Create } from './crud/create/Create'
import { UseCreator } from './crud/create/UseCreator'
import { Update } from './crud/update/Update'
import { Find } from './crud/find/Find'
import { Destroy } from './crud/destroy/Destroy'
import { UseUpdater } from './crud/update/UseUpdater'
import { UseFinder } from './crud/find/UseFinder'
import { UseDestroyer } from './crud/destroy/UseDestroyer'
import { VueModelConfig } from '../plugin/state'
import { VueModelDriverFeatures } from './VueModelDriverFeatures'
import { UseBulkUpdater } from './bulk-update/UseBulkUpdater'
import { BulkUpdate } from './bulk-update/BulkUpdate'
import { Sync } from './sync/Sync'

export interface VueModelDriver<T extends typeof Model = typeof Model> {
  create: Create<T>
  useCreator: UseCreator<T>

  index: Index<T>
  useIndexer: UseIndexer<T>

  update: Update<T>
  useUpdater: UseUpdater<T>

  find: Find<T>
  useFinder: UseFinder<T>

  destroy: Destroy<T>
  useDestroyer: UseDestroyer<T>

  bulkUpdate?: BulkUpdate<T>
  useBulkUpdater?: UseBulkUpdater<T>

  sync?: Sync<T>

  features: VueModelDriverFeatures
}

/**
 * Interface/Contract for a VueModel driver
 */
export type VueModelDriverConfig<T extends typeof Model = typeof Model> = {
  config?: VueModelConfig
  driver: VueModelDriver<T>
}
