import { Query } from 'pinia-orm'
import { IndexResourcesPagination } from '@vuemodel/core'

export function applyPagination (
  query: Query,
  pagination: IndexResourcesPagination,
) {
  query.limit(pagination.recordsPerPage)

  if (pagination.page) {
    query.offset((pagination.page - 1) * pagination.recordsPerPage)
  }
}
