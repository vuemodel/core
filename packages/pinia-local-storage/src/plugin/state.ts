import { FormValidationErrors, QueryValidationErrors, StandardErrors } from '@vuemodel/core'
import { Pinia } from 'pinia'
import { Database, Model } from 'pinia-orm'

export interface PiniaLocalStoragePluginOptions {

}

export interface PiniaLocalStorageState {
  /**
   * The pinia-orm backend store. This plugin creates its own
   * store so that it doesn't clash with the default store
   * pinia creates for you. So we have two browsers
   * stores. One for the "backend" (this one) and
   * one for the "frontend".
   */
  store?: Pinia

  /**
   * The pinia-orm frontend store
   */
  frontStore?: Pinia

  /**
   * The pinia-orm database. This plugin creates its own
   * database so that it doesn't clash with the default
   * database pinia-orm creates for you. So we have
   * two browser databases. One for the "backend"
   * (this one) and one for the "frontend".
   */
  database?: Database

  /**
   * An artificial latency for requests. This is used for
   * testing, and can be a good way to "mimic" latency
   * while developing. Especailly useful working with
   * loading spinners.
   */
  mockLatencyMs?: number

  /**
   * Only used for testing. When this value is set, all
   * requests will fail with these standard errors.
   */
  mockStandardErrors?: StandardErrors

  /**
   * When this value is set, all requests will fail with these validation errors.
   * Only intended to be used for testing/development.
   */
  mockValidationErrors?: FormValidationErrors<typeof Model> | QueryValidationErrors
}

export const piniaLocalStorageState: PiniaLocalStorageState = {

}
