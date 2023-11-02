import { Database, useRepo } from 'pinia-orm'
import { piniaLocalStorageState } from '../plugin/state'
import { getItem } from 'localforage'

const insertedModels: Record<string, boolean> = {}

export async function ensureModelRecordsInStore (database: Database) {
  const models = database?.models
  if (models) {
    for (const entry of Object.entries(models)) {
      if (!insertedModels[entry[0]]) {
        const repo = useRepo(entry[1].constructor, piniaLocalStorageState.store)
        const recordsKey = `${entry[0]}.records`
        const records = (await getItem(recordsKey)) ?? {}
        repo.insert(Object.values(records))

        insertedModels[entry[0]] = true
      }
    }
  }
}
