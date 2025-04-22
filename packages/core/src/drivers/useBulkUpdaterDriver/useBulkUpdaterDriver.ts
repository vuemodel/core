import { Model } from 'pinia-orm'
import { UseBulkUpdaterOptions, UseBulkUpdaterReturn } from '../../contracts/bulk-update/UseBulkUpdater'
import { BulkUpdater } from './BulkUpdater'

export function useBulkUpdaterDriver<T extends typeof Model> (
  ModelClass: T,
  options?: UseBulkUpdaterOptions<T>,
): UseBulkUpdaterReturn<T> {
  const bulkUpdater = new BulkUpdater(ModelClass, options)

  const bound = (fn: Function) => fn.bind(bulkUpdater)

  return {
    update: bound(bulkUpdater.update),
    formsKeyed: bulkUpdater.formsKeyed,
    changes: bulkUpdater.changes,
    makeForms: bound(bulkUpdater.formMaker.makeForms),
    removeForm: bound(bulkUpdater.removeForm),
    updating: bulkUpdater.updating,
    response: bulkUpdater.response,
    validationErrors: bulkUpdater.validationErrors,
    standardErrors: bulkUpdater.standardErrors,
    meta: bulkUpdater.meta,
    repo: bulkUpdater.repo,
    activeRequest: bulkUpdater.activeRequest,
    activeRequests: bulkUpdater.activeRequests,
    belongsToManyResponses: bulkUpdater.belongsToManyResponses,
    activeBelongsToManyRequests: bulkUpdater.activeBelongsToManyRequests,
    forms: bulkUpdater.forms,
    composableId: bulkUpdater.composableId,
    ModelClass,

    indexer: bulkUpdater.indexer,
    index: bound(bulkUpdater.index),
    indexing: bulkUpdater.indexer.indexing,
    isFirstPage: bulkUpdater.indexer.isFirstPage,
    isLastPage: bulkUpdater.indexer.isLastPage,
    pagination: bulkUpdater.indexer.pagination,
    currentPageIds: bulkUpdater.currentPageIds,
    next: bound(bulkUpdater.next),
    previous: bound(bulkUpdater.previous),
    toFirstPage: bound(bulkUpdater.toFirstPage),
    toLastPage: bound(bulkUpdater.toLastPage),
    toPage: bound(bulkUpdater.toPage),
    records: bulkUpdater.indexer.records,
    updatedRecords: bulkUpdater.updatedRecords,

    onError: bound(bulkUpdater.onErrorCallbacks.add),
    onStandardError: bound(bulkUpdater.onStandardErrorCallbacks.add),
    onSuccess: bound(bulkUpdater.onSuccessCallbacks.add),
    onValidationError: bound(bulkUpdater.onValidationErrorCallbacks.add),
  }
}
