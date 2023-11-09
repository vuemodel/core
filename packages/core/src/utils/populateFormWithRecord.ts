import { Item, Model } from 'pinia-orm'
import { Ref } from 'vue'

export function populateFormWithRecord (
  record: Item<Model>,
  form: Ref<Record<string, any>>,
) {
  if (!record) { return }
  const fields = record.$fields()
  Object.keys(fields).forEach(field => {
    form.value[field] = record[field]
  })
}
