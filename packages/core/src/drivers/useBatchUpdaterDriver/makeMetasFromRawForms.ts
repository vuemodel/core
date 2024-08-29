import { PiniaOrmForm } from 'pinia-orm-helpers'
import { BatchUpdateMeta, UseBatchUpdaterReturn } from '../../contracts/batch-update/UseBatchUpdater'
import { Model } from 'pinia-orm'

export function makeMetasFromRawForms<
  T extends typeof Model,
  R extends UseBatchUpdaterReturn<T>
> (
  options: {
    rawForms: Record<string, PiniaOrmForm<InstanceType<T>>>,
    defaultMeta: BatchUpdateMeta<InstanceType<T>>
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
