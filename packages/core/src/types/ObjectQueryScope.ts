import { IndexResourcesFiltersLoose } from '../contracts/crud/index/IndexResourcesFiltersLoose'
import { IndexResourcesIncludesLoose } from '../contracts/crud/index/IndexResourcesIncludesLoose'
import { SortByLoose } from '../contracts/crud/index/IndexResourcesSortsLoose'

export interface ObjectQueryScope {
  filters?: IndexResourcesFiltersLoose
  sortBy?: SortByLoose
  includes?: IndexResourcesIncludesLoose
}
