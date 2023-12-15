import { between } from './between'

/* eslint-disable eqeqeq */
export type WhereFunction = (fieldsValue: string, passedValue: any) => boolean

export const whereFunctions: Record<string, WhereFunction> = {
  equals: (fieldsValue: string, passedValue: string | number | boolean | null) => {
    return fieldsValue == passedValue
  },
  doesNotEqual: (fieldsValue: string, passedValue: string | number | boolean | null) => {
    return fieldsValue != passedValue
  },
  lessThan: (fieldsValue: string, passedValue: string | number) => {
    return fieldsValue < passedValue
  },
  lessThanOrEqual: (fieldsValue: string, passedValue: string | number) => {
    return fieldsValue <= passedValue
  },
  greaterThan: (fieldsValue: string, passedValue: string | number) => {
    return fieldsValue > passedValue
  },
  greaterThanOrEqual: (fieldsValue: string, passedValue: string | number) => {
    return fieldsValue >= passedValue
  },
  in: (fieldsValue: string, passedValue: (string | number)[]) => {
    return passedValue?.includes(fieldsValue)
  },
  notIn: (fieldsValue: string, passedValue: (string | number)[]) => {
    return !passedValue?.includes(fieldsValue)
  },
  contains: (fieldsValue: string, passedValue: string) => {
    return fieldsValue?.toLowerCase()?.includes(passedValue?.toLowerCase())
  },
  doesNotContain: (fieldsValue: string, passedValue: string) => {
    return !fieldsValue?.toLowerCase()?.includes(passedValue?.toLowerCase())
  },
  between: (fieldsValue: string, passedValue: [string | number | Date, string | number | Date]) => {
    return between(fieldsValue, passedValue)
  },
  startsWith: (fieldsValue: string, passedValue: string | number) => {
    return fieldsValue?.startsWith(String(passedValue))
  },
  endsWith: (fieldsValue: string, passedValue: string | number) => {
    return fieldsValue?.endsWith(String(passedValue))
  },
}
