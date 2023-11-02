import { createResource } from '@vuemodel/core'
import { exampleDataMap } from 'sample-data'

export async function populateRecords (
  entity: keyof typeof exampleDataMap,
  numberOfRecords: number,
  createOptions?: Parameters<typeof createResource>[2],
) {
  const exampleData = exampleDataMap[entity]

  for (let index = 0; index < numberOfRecords; index++) {
    await createResource(
      exampleData.modelClass,
      exampleData.records[index],
      createOptions,
    )
  }
}
