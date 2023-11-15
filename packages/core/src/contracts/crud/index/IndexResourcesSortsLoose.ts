export type SortDirection = 'ascending' | 'descending'

export interface Sort {
  field: string
  direction: SortDirection
}

export type SortByLoose = Sort[]
