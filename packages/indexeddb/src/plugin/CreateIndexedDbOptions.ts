import { StandardErrors, FormValidationErrors } from '@vuemodel/core'
import { Pinia } from 'pinia'
import { Model } from 'pinia-orm'

export interface CreateIndexedDbOptions {
  /**
   * The pinia-orm frontend store
   */
  frontStore: Pinia

  /**
   * The pinia-orm backend store
   */
  backStore?: Pinia

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
   * Only used for testing. When this value is set, all
   * requests will fail with these validation errors.
   */
  mockValidationErrors?: FormValidationErrors<typeof Model>
}
