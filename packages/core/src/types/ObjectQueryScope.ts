import { IndexFiltersLoose } from '../contracts/crud/index/IndexFiltersLoose'
import { IndexWithsLoose } from '../contracts/crud/index/IndexWithsLoose'
import { OrderByLoose } from '../contracts/crud/index/IndexOrdersLoose'

export interface ObjectQueryScope {
  filters?: IndexFiltersLoose
  orderBy?: OrderByLoose
  with?: IndexWithsLoose
}
