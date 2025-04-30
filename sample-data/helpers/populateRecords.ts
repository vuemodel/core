import { create, find, getRecordPrimaryKey } from '@vuemodel/core'
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

  const promises: Promise<void>[] = []

  for (let index = 0; index < numberOfRecords; index++) {
    try {
      const ModelClass = exampleData.modelClass
      if (!ModelClass) continue
      const promise = async () => {
        /** @ts-expect-error This error baffles me */
        const response = await find(ModelClass, getRecordPrimaryKey(ModelClass, exampleData.records[index]))
        if (response.record) return
        await create(
          exampleData.modelClass,
          exampleData.records[index],
          createOptions,
        )
      }
      promises.push(promise())
    } catch (e) {
      console.warn(e)
    }
  }

  await Promise.all(promises)
}
