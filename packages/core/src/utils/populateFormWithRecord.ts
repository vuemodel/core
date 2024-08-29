import { Item, Model } from 'pinia-orm'
import { Ref } from 'vue'

export function populateFormWithRecord (
  record: Item<Model>,
  form: Ref<Record<string, any>>,
  excludeFields: string[] = [],
) {
  if (!record) { return }
  const fields = record.$fields()
  Object.keys(fields).forEach(field => {
    if (excludeFields.includes(field)) return
    form.value[field] = record[field]
  })
}
