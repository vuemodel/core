import { Form } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'

const createdDatabases: { [key: string]: boolean } = {} // Global cache for created databases

class ModelRepo<T extends typeof Model> {
  private storeName: string
  private primaryKeyField: string | string[]

  constructor (ModelClass: T, prefix: string = '') {
    this.storeName = prefix + ModelClass.entity
    this.primaryKeyField = ModelClass.primaryKey
  }

  private async ensureDbExists (): Promise<IDBDatabase> {
    // Check if the database has already been created in the cache
    if (createdDatabases[this.storeName]) {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.storeName)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(`Failed to open DB: ${request.error}`)
      })
    }

    // If not in cache, create the database
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.storeName, 1)

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, {
            keyPath: this.primaryKeyField,
          })
        }
      }

      request.onsuccess = () => {
        // Mark the database as created in the cache
        createdDatabases[this.storeName] = true
        resolve(request.result)
      }

      request.onerror = () => {
        reject(`Failed to open DB: ${request.error}`)
      }
    })
  }

  async create (record: DeclassifyPiniaOrmModel<InstanceType<T>>) {
    const db = await this.ensureDbExists()
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite')
      const store = tx.objectStore(this.storeName)
      const request = store.add(record)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async find (id: any) {
    const db = await this.ensureDbExists()
    return new Promise<DeclassifyPiniaOrmModel<InstanceType<T>> | undefined>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly')
      const store = tx.objectStore(this.storeName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result as DeclassifyPiniaOrmModel<InstanceType<T>>)
      request.onerror = () => reject(request.error)
    })
  }

  async update (id: any, updates: Partial<DeclassifyPiniaOrmModel<InstanceType<T>>>) {
    const db = await this.ensureDbExists()
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite')
      const store = tx.objectStore(this.storeName)
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const existingRecord = getRequest.result
        if (!existingRecord) {
          return reject(`Record with id ${id} not found`)
        }

        const updatedRecord = { ...existingRecord, ...updates }
        const putRequest = store.put(updatedRecord)

        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(putRequest.error)
      }

      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async destroy (id: any) {
    const db = await this.ensureDbExists()
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite')
      const store = tx.objectStore(this.storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async index (options: {
    pagination?: { page: number; recordsPerPage: number };
    ids?: string[] | string[][];
  } = {}) {
    const { pagination, ids } = options
    const db = await this.ensureDbExists()

    if (ids && ids.length > 0) {
      // Fetch specific records by ids
      return this.fetchByIds(db, ids)
    } else if (pagination) {
      // Use optimized pagination with openCursor
      return this.paginatedFetch(db, pagination.page, pagination.recordsPerPage)
    } else {
      // Fetch all records without pagination
      return this.fetchAll(db)
    }
  }

  private fetchByIds (db: IDBDatabase, ids: string[] | string[][]): Promise<T[]> {
    return new Promise((resolve) => {
      const tx = db.transaction(this.storeName, 'readonly')
      const store = tx.objectStore(this.storeName)
      const results: T[] = []
      let fetchCount = 0

      ids.forEach((id) => {
        const request = store.get(id) // Direct lookup by primary key

        request.onsuccess = () => {
          if (request.result) {
            results.push(request.result) // Add only if record exists
          }
          fetchCount++
          // Once all IDs have been processed, resolve the results
          if (fetchCount === ids.length) {
            resolve(results)
          }
        }

        request.onerror = () => {
          fetchCount++
          // Skip over non-existent records, continue fetching the others
          if (fetchCount === ids.length) {
            resolve(results) // Resolve results even if some requests failed
          }
        }
      })
    })
  }

  private paginatedFetch (db: IDBDatabase, page: number, recordsPerPage: number): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly')
      const store = tx.objectStore(this.storeName)
      const results: T[] = []
      const cursorRequest = store.openCursor()
      let skipCount = (page - 1) * recordsPerPage
      let count = 0

      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result

        if (!cursor) {
          resolve(results) // No more results
          return
        }

        if (skipCount > 0) {
          // Skip the records until we reach the desired page
          skipCount--
          cursor.continue()
          return
        }

        // Collect the records for the current page
        results.push(cursor.value)
        count++

        if (count < recordsPerPage) {
          cursor.continue()
        } else {
          resolve(results) // We've collected enough records for the page
        }
      }

      cursorRequest.onerror = () => reject(cursorRequest.error)
    })
  }

  private fetchAll (db: IDBDatabase): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly')
      const store = tx.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => reject(request.error)
    })
  }

  async batchUpdate (forms: { [id: string]: Partial<Form<InstanceType<T>>> }) {
    const db = await this.ensureDbExists()

    return new Promise<void>((resolve, reject) => {
      // Create a single transaction for batch updates
      const tx = db.transaction(this.storeName, 'readwrite')
      const store = tx.objectStore(this.storeName)

      const ids = Object.keys(forms)
      let successCount = 0

      ids.forEach((id) => {
        const getRequest = store.get(id)

        getRequest.onsuccess = () => {
          const existingRecord = getRequest.result
          if (existingRecord) {
            const updatedRecord = { ...existingRecord, ...forms[id] }
            store.put(updatedRecord) // Use store.put inside the same transaction
          } else {
            console.warn(`Record with id ${id} not found. Skipping.`)
          }
          successCount++
          if (successCount === ids.length) {
            resolve()
          }
        }

        getRequest.onerror = () => {
          console.warn(`Failed to fetch record with id ${id}. Skipping.`)
          successCount++
          if (successCount === ids.length) {
            resolve() // Resolve even if some updates failed
          }
        }
      })

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(`Transaction failed: ${tx.error}`)
    })
  }
}

export function createIndexedDbRepo<T extends typeof Model> (ModelClass: T, options?: { prefix?: string }) {
  const prefix = options?.prefix ?? ''
  return new ModelRepo<T>(ModelClass, prefix)
}
