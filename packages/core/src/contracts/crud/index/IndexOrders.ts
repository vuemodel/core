import { Model } from 'pinia-orm'
import { DeclassifyPiniaOrmModel } from '../../../types/DeclassifyPiniaOrmModel'

export type OrderDirection = 'ascending' | 'descending'

export interface Order<T extends Model> {
  // (string & Record<never, never>) is a workaround. We get autocompletion, but allow any value.
  field: (keyof DeclassifyPiniaOrmModel<T>) | (string & Record<never, never>)
  direction: OrderDirection
}

export type OrderBy<T extends Model> = Order<T>[]
