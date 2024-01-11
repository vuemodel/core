import { Pinia } from 'pinia'
import { PrimaryKey } from 'pinia-orm'
import { Wretch } from 'wretch'

export interface OrionDriverOptions {
  name: string,

  /**
   * The pinia-orm frontend store
   */
  store?: Pinia

  /**
   *
   */
  createWretch: (context?: {
    data?: Record<string, any>
    primaryKey?: PrimaryKey
  }) => Wretch | Promise<Wretch>
}

export type OrionState = Record<string, OrionDriverOptions>

export const orionState: OrionState = {}
