import { Model } from 'pinia-orm'
import { Form } from '../..'

export type FormValidationErrors<T extends typeof Model = any> = {
  [K in keyof Form<InstanceType<T>>]: string[];
} & {
  [key: string]: string[];
};
