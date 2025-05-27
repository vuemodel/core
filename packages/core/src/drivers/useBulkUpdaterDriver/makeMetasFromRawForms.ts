import { BulkUpdateMeta, UseBulkUpdaterReturn } from '../../contracts/bulk-update/UseBulkUpdater'
import { Model } from 'pinia-orm'
import { Form } from '../../types/Form'

export function makeMetasFromRawForms<
  T extends typeof Model,
  R extends UseBulkUpdaterReturn<T>
> (
  options: {
    rawForms: Record<string, Form<InstanceType<T>>>,
    defaultMeta: BulkUpdateMeta<T>
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
