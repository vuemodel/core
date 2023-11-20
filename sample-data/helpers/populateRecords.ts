import { create } from '@vuemodel/core'
import { exampleDataMap } from '../src'

export async function populateRecords (
  entity: keyof typeof exampleDataMap,
  numberOfRecords?: number,
  createOptions?: Parameters<typeof create>[2],
) {
  const exampleData = exampleDataMap[entity]

  if (!numberOfRecords) {
    numberOfRecords = exampleData.records.length
  }

  for (let index = 0; index < numberOfRecords; index++) {
    await create(
      exampleData.modelClass,
      exampleData.records[index],
      createOptions,
    )
  }
}
