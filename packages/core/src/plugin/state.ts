import { StandardErrors } from '../contracts/errors/StandardErrors'
import { VueModelDriver } from '../contracts/VueModelDriver'
import { FormValidationErrors } from '../contracts/errors/FormValidationErrors'
import { Model } from 'pinia-orm'
import { NotifyOnErrorOptions } from '../types/NotifyOnErrorOptions'
import { Pinia } from 'pinia'
import { ObjectQueryScope } from '../types/ObjectQueryScope'

export type ErrorNotifyErrors = {
  standardErrors: StandardErrors
}
export type NotifyErrorsWithValidation = {
  validationErrors: FormValidationErrors<typeof Model>
} & ErrorNotifyErrors

export type ErrorNotifier = (options: { model: typeof Model, errors: ErrorNotifyErrors }) => void
export type ErrorNotifierWithValidation = (options: { model: typeof Model, errors: NotifyErrorsWithValidation }) => void

export type PluginScope = string | { name: string, paramaters: Record<string, any> | (() => Record<string, any>) }
export type PluginScopeConfig = ObjectQueryScope |
((
  context?: { entity: string, driver: string },
  payload?: any
) => ObjectQueryScope)

export type VueModelConfig = {
  pinia?: Pinia
  notifyOnError?: NotifyOnErrorOptions | undefined
  autoUpdateDebounce?: number
  pagination?: {
    recordsPerPage?: number
  }
  errorNotifiers?: {
    create?: ErrorNotifierWithValidation
    update?: ErrorNotifierWithValidation
    index?: ErrorNotifierWithValidation
    remove?: ErrorNotifier
    find?: ErrorNotifierWithValidation
  }
  scopes?: Record<string, PluginScopeConfig>
  entityScopes?: Record<string, Record<string, PluginScopeConfig>>
  globallyAppliedScopes?: PluginScope[]
  globallyAppliedEntityScopes?: Record<string, PluginScope[]>
}

export interface VueModelState {
  /**
   * The default implementation to be used
   */
  default?: string

  /**
   * Drivers that implement the `VueModelDriver` contract
   */
  drivers: Record<string, VueModelDriver>

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
