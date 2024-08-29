import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'

export type Forms<T extends Model> = Record<string | number, PiniaOrmForm<T>>
