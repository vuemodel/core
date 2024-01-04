import { FilterType } from './crud/index/IndexFilters'

export interface VueModelDriverFeatures {
  find: {
    available: boolean,
    validationErrors: boolean,
    order: {
      shallow: boolean,
      nested: boolean
    },
    filter: {
      shallow: boolean,
      nested: boolean,
      operators: FilterType[]
    }
  },
  index: {
    available: boolean,
    validationErrors: boolean,
    order: {
      shallow: boolean,
      nested: boolean
    },
    filter: {
      shallow: boolean,
      nested: boolean,
      operators: FilterType[]
    }
  },
  create: {
    available: boolean,
    validationErrors: boolean
  },
  destroy: {
    available: boolean,
  },
  update: {
    available: boolean,
    validationErrors: boolean
  }
}
