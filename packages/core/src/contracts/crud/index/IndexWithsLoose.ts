import { IndexFiltersLoose } from './IndexFiltersLoose'
import { OrderByLoose } from './IndexOrdersLoose'

export type WithTypeToValue = {
    [key: string]: IndexWithsInternal
  } & { _orderBy?: OrderByLoose }
    & { _limit?: number };

export type IndexWithsInternal = WithTypeToValue | IndexFiltersLoose;

export type IndexWithsLoose = { [key: string]: WithTypeToValue | IndexFiltersLoose }
