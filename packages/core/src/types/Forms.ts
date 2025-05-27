import { Model } from 'pinia-orm'
import { Form } from './Form'

export type Forms<T extends Model> = Record<string | number, Form<T>>
