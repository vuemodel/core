import { type UseBulkUpdaterReturn } from '@vuemodel/core'
import type { QTableProps } from 'quasar'
import { ref, toValue, watch, type Ref } from 'vue'

export function bindQTablePagination (
  vueModelPagination: UseBulkUpdaterReturn['pagination'],
): {
  pagination: Ref<QTableProps['pagination']>
  onRequest: QTableProps['onRequest']
} {
  const originalPagination = toValue(vueModelPagination)

  const qTablePagination = ref<QTableProps['pagination']>({
    page: originalPagination.page,
    rowsNumber: originalPagination.recordsCount,
    rowsPerPage: originalPagination.recordsPerPage,
  })

  watch(() => vueModelPagination, () => {
    if (!qTablePagination.value) return
    const resolvedPagination = toValue(vueModelPagination)
    if (
      qTablePagination.value.page !== resolvedPagination.page ||
      qTablePagination.value.rowsNumber !== resolvedPagination.recordsCount ||
      qTablePagination.value.rowsPerPage !== resolvedPagination.recordsPerPage
    ) {
      qTablePagination.value = {
        page: resolvedPagination.page,
        rowsNumber: resolvedPagination.recordsCount,
        rowsPerPage: resolvedPagination.recordsPerPage,
      }
    }
  }, { deep: true })

  const onRequest: QTableProps['onRequest'] = ({ pagination }) => {
    vueModelPagination.value = {
      page: pagination.page,
      pagesCount: pagination.rowsNumber,
      recordsPerPage: pagination.rowsPerPage,
    }

    qTablePagination.value = {
      page: pagination.page,
      rowsNumber: pagination.rowsNumber,
      rowsPerPage: pagination.rowsPerPage,
    }
  }

  return {
    pagination: qTablePagination,
    onRequest,
  }
}
