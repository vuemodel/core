import { IndexResourcesFiltersLoose } from './IndexResourcesFiltersLoose'
import { SortByLoose } from './IndexResourcesSortsLoose'

export type IncludeTypeToValue = {
    [key: string]: IndexResourcesIncludesInternal
  } & { _sortBy?: SortByLoose }
    & { _limit?: number };

export type IndexResourcesIncludesInternal = IncludeTypeToValue | IndexResourcesFiltersLoose;

export type IndexResourcesIncludesLoose = { [key: string]: IncludeTypeToValue | IndexResourcesFiltersLoose }
