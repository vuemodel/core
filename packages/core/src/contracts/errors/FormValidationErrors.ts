import { Model } from 'pinia-orm'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'

export type FormValidationErrors<T extends typeof Model> = {
  [K in keyof Partial<DeclassifyPiniaOrmModel<InstanceType<T>>>]: string[];
} & {
  [key: string]: string[];
};
