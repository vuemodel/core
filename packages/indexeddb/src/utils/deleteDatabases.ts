import { getDriverKey } from '@vuemodel/core'

export async function deleteDatabases (driver?: string) {
  const driverKey = getDriverKey(driver)

  const databases = await indexedDB.databases()
  const databaseNames = databases.map(database => database.name)

  const promises = databaseNames
    .filter(name => {
      return name?.startsWith(driverKey)
    })
    .map(name => {
      return new Promise<Event | void>((resolve, reject) => {
        if (!name) return resolve()
        const DBDeleteRequest = indexedDB.deleteDatabase(name)
        DBDeleteRequest.onerror = (event) => {
          reject({ message: 'Error deleting database.', event })
        }

        DBDeleteRequest.onsuccess = (event) => {
          resolve(event)
        }
      })
    })
  await Promise.all(promises)
}
