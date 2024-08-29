import { Query } from 'pinia-orm'
import { IndexPagination } from '@vuemodel/core'

export function applyPagination (
  query: Query,
  pagination: IndexPagination,
) {
  if (!pagination.recordsPerPage) return

  query.limit(Number(pagination.recordsPerPage ?? pagination.recordsPerPage))

  if (pagination.page) {
    query.offset((pagination.page - 1) * pagination.recordsPerPage)
  }
}
