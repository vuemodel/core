import { PiniaOrmForm } from 'pinia-orm-helpers'
import { BulkUpdateMeta, UseBulkUpdaterReturn } from '../../contracts/bulk-update/UseBulkUpdater'
import { Model } from 'pinia-orm'

export function makeMetasFromRawForms<
  T extends typeof Model,
  R extends UseBulkUpdaterReturn<T>
> (
  options: {
    rawForms: Record<string, PiniaOrmForm<InstanceType<T>>>,
    defaultMeta: BulkUpdateMeta<InstanceType<T>>
    meta: R['meta']
  },
) {
  const { rawForms, defaultMeta, meta } = options

  Object.entries(rawForms).forEach(([targetId, form]) => {
    if (!meta.value[targetId]) {
      meta.value[targetId] = structuredClone(defaultMeta)
      meta.value[targetId].initialValues = structuredClone(form)
    }
  })
}
