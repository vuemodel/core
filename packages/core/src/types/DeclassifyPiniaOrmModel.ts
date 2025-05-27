import { Model } from 'pinia-orm'
import { RemoveIndex } from './RemoveIndex'

export type DeclassifyPiniaOrmModel<T extends Model> = Omit<
  RemoveIndex<T>,
  keyof RemoveIndex<Model>
>
