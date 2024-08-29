import { IndexPagination } from '@vuemodel/core'

export function applyPagination (
  query: any,
  pagination: IndexPagination,
) {
  if (!pagination.recordsPerPage) return

  query.limit = pagination.recordsPerPage
  if (pagination.page) {
    query.page = pagination.page
  }
}
