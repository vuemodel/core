import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { Model } from 'pinia-orm'

export type SortDirection = 'ascending' | 'descending'

export interface Sort<T extends typeof Model> {
  // (string & Record<never, never>) is a workaround. We get autocompletion, but allow any value.
  field: (keyof DeclassifyPiniaOrmModel<InstanceType<T>>) | (string & Record<never, never>)
  direction: SortDirection
}

export type SortBy<T extends typeof Model> = Sort<T>[]
