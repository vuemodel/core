import { FilterType } from '@vuemodel/core'

export const operatorMap: Record<FilterType, {
  operator: string
  transformValue?: (value: any) => string
} |
  ((field: string, value: any) => ({ field: string, operator: string, value: string })[])
> = {
  equals: {
    operator: '=',
  },
  doesNotEqual: {
    operator: '!=',
  },
  greaterThan: {
    operator: '>',
  },
  lessThan: {
    operator: '<',
  },
  greaterThanOrEqual: {
    operator: '>=',
  },
  lessThanOrEqual: {
    operator: '<=',
  },
  contains: {
    operator: 'like',
    transformValue: (value) => `%${value}%`,
  },
  doesNotContain: {
    operator: 'not like',
    transformValue: (value) => `%${value}%`,
  },
  startsWith: {
    operator: 'like',
    transformValue: (value) => `${value}%`,
  },
  endsWith: {
    operator: 'like',
    transformValue: (value) => `%${value}`,
  },
  in: {
    operator: 'in',
  },
  notIn: {
    operator: 'not in',
  },
  between: (field: string, value: [any, any]) => {
    return [
      { field, operator: '>=', value: value[0] },
      { field, operator: '<=', value: value[1] },
    ]
  },
}
