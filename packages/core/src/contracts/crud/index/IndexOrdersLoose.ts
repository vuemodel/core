export type OrderDirection = 'ascending' | 'descending'

export interface Order {
  field: string
  direction: OrderDirection
}

export type OrderByLoose = Order[]
