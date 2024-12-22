import { StandardErrors } from '../contracts/errors/StandardErrors'
import { VueModelDriverConfig } from '../contracts/VueModelDriver'
import { FormValidationErrors } from '../contracts/errors/FormValidationErrors'
import { Model } from 'pinia-orm'
import { NotifyOnErrorOptions } from '../types/NotifyOnErrorOptions'
import { Pinia } from 'pinia'
import { ObjectQueryScope } from '../types/ObjectQueryScope'
import { Response } from '../types/Response'
import { BulkUpdatedHookPayload, BulkUpdatePersistHookPayload, BulkUpdatingHookPayload, CreatedHookPayload, CreateOptimisticPersistHookPayload, CreatePersistHookPayload, CreatingHookPayload, DestroyedHookPayload, DestroyingHookPayload, DestroyOptimisticPersistHookPayload, DestroyPersistHookPayload, FindingHookPayload, FindPersistHookPayload, FoundHookPayload, IndexedHookPayload, IndexingHookPayload, IndexPersistHookPayload, SyncedHookPayload, SyncingHookPayload, SyncPersistHookPayload, UpdatedHookPayload, UpdateOptimisticPersistHookPayload, UpdatePersistHookPayload, UpdatingHookPayload } from '../hooks/Hooks'

export type ErrorNotifyErrors = {
  standardErrors: StandardErrors
}
export type NotifyErrorsWithValidation = {
  validationErrors: FormValidationErrors<typeof Model>
} & ErrorNotifyErrors

export type NotifyErrorsWithBulkValidation = {
  validationErrors: Record<string, FormValidationErrors<typeof Model>>
} & ErrorNotifyErrors

export type ErrorNotifier = (options: { model: typeof Model, errors: ErrorNotifyErrors }) => void
export type ErrorNotifierWithValidation = (options: { model: typeof Model, errors: NotifyErrorsWithValidation }) => void
export type ErrorNotifierWithBulkValidation = (options: { model: typeof Model, errors: NotifyErrorsWithBulkValidation }) => void

export type PluginScope = string | { name: string, parameters: Record<string, any> | (() => Record<string, any>) }
export type PluginScopeConfig = ObjectQueryScope |
((
  context?: { ModelClass: typeof Model, entity: string, driver: string },
  payload?: any
) => ObjectQueryScope)

export type VueModelConfig = {
  pinia?: Pinia
  hooks?: {
    creating?: ((payload: CreatingHookPayload) => Promise<void> | void)[]
    created?: ((payload: CreatedHookPayload) => Promise<void> | void)[]
    createPersist?: ((payload: CreatePersistHookPayload) => Promise<void> | void)[]
    createOptimisticPersist?: ((payload: CreateOptimisticPersistHookPayload) => Promise<void> | void)[]
    updating?: ((payload: UpdatingHookPayload) => Promise<void> | void)[]
    updated?: ((payload: UpdatedHookPayload) => Promise<void> | void)[]
    updatePersist?: ((payload: UpdatePersistHookPayload) => Promise<void> | void)[]
    updateOptimisticPersist?: ((payload: UpdateOptimisticPersistHookPayload) => Promise<void> | void)[]
    indexing?: ((payload: IndexingHookPayload) => Promise<void> | void)[]
    indexed?: ((payload: IndexedHookPayload) => Promise<void> | void)[]
    indexPersist?: ((payload: IndexPersistHookPayload) => Promise<void> | void)[]
    finding?: ((payload: FindingHookPayload) => Promise<void> | void)[]
    found?: ((payload: FoundHookPayload) => Promise<void> | void)[]
    findPersist?: ((payload: FindPersistHookPayload) => Promise<void> | void)[]
    destroying?: ((payload: DestroyingHookPayload) => Promise<void> | void)[]
    destroyed?: ((payload: DestroyedHookPayload) => Promise<void> | void)[]
    destroyPersist?: ((payload: DestroyPersistHookPayload) => Promise<void> | void)[]
    destroyOptimisticPersist?: ((payload: DestroyOptimisticPersistHookPayload) => Promise<void> | void)[]
    bulkUpdating?: ((payload: BulkUpdatingHookPayload) => Promise<void> | void)[]
    bulkUpdated?: ((payload: BulkUpdatedHookPayload) => Promise<void> | void)[]
    bulkUpdatePersist?: ((payload: BulkUpdatePersistHookPayload) => Promise<void> | void)[]
    syncing?: ((payload: SyncingHookPayload) => Promise<void> | void)[]
    synced?: ((payload: SyncedHookPayload) => Promise<void> | void)[]
    syncPersist?: ((payload: SyncPersistHookPayload) => Promise<void> | void)[]
  },
  excludeFields?: string[]
  notifyOnError?: NotifyOnErrorOptions | undefined
  autoUpdateDebounce?: number | (() => number)
  optimistic?: boolean
  immediate?: boolean
  makeId?: (ModelClass: typeof Model) => string
  makeIdMap?: Record<string, (ModelClass: typeof Model) => string>
  pagination?: {
    recordsPerPage?: number
  }
  errorNotifiers?: {
    create?: ErrorNotifierWithValidation
    update?: ErrorNotifierWithValidation
    index?: ErrorNotifierWithValidation
    destroy?: ErrorNotifier
    find?: ErrorNotifierWithValidation
    bulkUpdate?: ErrorNotifierWithBulkValidation
    sync?: ErrorNotifierWithBulkValidation
  }
  scopes?: Record<string, PluginScopeConfig>
  entityScopes?: Record<string, Record<string, PluginScopeConfig>>
  globallyAppliedScopes?: PluginScope[]
  globallyAppliedEntityScopes?: Record<string, PluginScope[]>
  throw?: boolean | ((response: Response<typeof Model> | undefined, driver: string) => boolean)
  pivotIdField?: string | ((ModelClass: Model) => string)
  pivotIdFieldMap?: Record<string, string>
}

export interface VueModelState {
  /**
   * The default driver to be used
   */
  default?: string | (() => string)

  /**
   * Drivers that implement the `VueModelDriver` contract
   */
  drivers: Record<string, VueModelDriverConfig>

  /**
   * Base configuration that all drivers will inherit.
   *
   * This allows you to set a default setting across all drivers. e.g.
   * "always notifying the user when there is a request error".
   * this config has the lowest precedence.
   */
  config?: VueModelConfig
}

export const vueModelState: VueModelState = {
  default: 'default',
  drivers: {},
  config: {},
}
