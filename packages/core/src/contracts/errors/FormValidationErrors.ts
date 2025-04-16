import { Model } from 'pinia-orm'
import { Form } from '../..'

export type FormValidationErrors<T extends Model = any> = {
  [K in keyof Form<T>]: string[];
} & {
  [key: string]: string[];
};
