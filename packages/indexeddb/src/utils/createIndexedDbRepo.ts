import { DeclassifyPiniaOrmModel, Form } from '@vuemodel/core'
import clone from 'just-clone'
import { Model } from 'pinia-orm'

// const createdDatabases: { [key: string]: boolean } = {}

// A generic repository class for a given Pinia ORM Model
class ModelRepo<T extends typeof Model> {
  private storeName: string
  private primaryKeyField: string | string[]
  private ModelClass: T

  constructor (ModelClass: T, prefix: string = '') {
    this.ModelClass = ModelClass
    this.storeName = prefix + ModelClass.entity
    this.primaryKeyField = ModelClass.primaryKey
  }

  private parseId (id: any) {
    if (Array.isArray(this.primaryKeyField) &&
      typeof id === 'string' &&
      id.startsWith('[') &&
      id.endsWith(']')
    ) {
      return JSON.parse(id)
    }
    return id
  }

  /**
   * Create or open a database for the current `storeName`.
   * Uses a global cache to avoid re-creating the object store repeatedly.
   */
  private async ensureDbExists (): Promise<IDBDatabase> {
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
        resolve(request.result)
      }

      request.onerror = () => {
        reject(`Failed to open DB: ${request.error}`)
      }
    })
  }

  /**
   * Insert a new record into the DB.
   */
  async create (record: DeclassifyPiniaOrmModel<InstanceType<T>>): Promise<void> {
    const db = await this.ensureDbExists()
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite')
      const store = tx.objectStore(this.storeName)
      store.add(record)

      tx.oncomplete = () => {
        db.close()
        resolve()
      }

      tx.onerror = () => {
        db.close()
        reject(tx.error)
      }
    })
  }

  /**
   * Fetch a single record by ID.
   */
  async find (id: any): Promise<DeclassifyPiniaOrmModel<InstanceType<T>> | undefined> {
    id = this.parseId(id)
    const db = await this.ensureDbExists()
    return new Promise((resolve, reject) => {
      let result: DeclassifyPiniaOrmModel<InstanceType<T>> | undefined
      const tx = db.transaction(this.storeName, 'readonly')
      const store = tx.objectStore(this.storeName)
      const request = store.get(id)

      request.onsuccess = () => {
        result = request.result as DeclassifyPiniaOrmModel<InstanceType<T>> | undefined
      }
      request.onerror = () => {
        reject(request.error)
      }

      tx.oncomplete = () => {
        db.close()
        resolve(result)
      }

      tx.onerror = () => {
        db.close()
        reject(tx.error)
      }
    })
  }

  /**
   * Update a record by merging `updates` into the existing record.
   */
  async update (id: any, updates: Partial<DeclassifyPiniaOrmModel<InstanceType<T>>>): Promise<ReturnType<Model['$getKey']>> {
    id = this.parseId(id)
    const db = await this.ensureDbExists()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite')
      const store = tx.objectStore(this.storeName)
      const getRequest = store.get(id)

      let newId: ReturnType<Model['$getKey']> = ''

      getRequest.onsuccess = () => {
        const existingRecord = getRequest.result
        if (!existingRecord) {
          return
        }
        const updatedRecord = clone({ ...existingRecord, ...updates })
        newId = (new this.ModelClass(updatedRecord)).$getKey()
        store.put(updatedRecord)
      }

      getRequest.onerror = () => {
        reject(getRequest.error)
      }

      tx.oncomplete = () => {
        db.close()
        resolve(newId)
      }
      tx.onerror = () => {
        db.close()
        reject(tx.error)
      }
    })
  }

  /**
   * Delete a record by ID.
   */
  async destroy (id: any): Promise<void> {
    id = this.parseId(id)
    const db = await this.ensureDbExists()
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite')
      const store = tx.objectStore(this.storeName)
      store.delete(id)

      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => {
        db.close()
        reject(tx.error)
      }
    })
  }

  /**
   * Fetch multiple records, optionally by IDs or pagination.
   */
  async index (options: {
    pagination?: { page: number; recordsPerPage: number }
    ids?: string[] | string[][]
  } = {}): Promise<T[] | DeclassifyPiniaOrmModel<InstanceType<T>>[]> {
    const { pagination, ids } = options
    const db = await this.ensureDbExists()

    if (ids && ids.length > 0) {
      // Fetch specific records by IDs
      return this.fetchByIds(db, ids)
    } else if (pagination) {
      // Use a cursor for paginated fetch
      return this.paginatedFetch(db, pagination.page, pagination.recordsPerPage)
    } else {
      // Fetch all records
      return this.fetchAll(db)
    }
  }

  /**
   * Fetch records by multiple IDs.
   */
  private fetchByIds (db: IDBDatabase, ids: string[] | string[][]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly')
      const store = tx.objectStore(this.storeName)
      const results: T[] = []

      tx.oncomplete = () => {
        db.close()
        resolve(results)
      }

      tx.onerror = () => {
        db.close()
        reject(tx.error)
      }

      ids.forEach((id) => {
        const request = store.get(id)
        request.onsuccess = () => {
          if (request.result) {
            results.push(request.result)
          }
        }
        request.onerror = () => {
          console.warn(`Error fetching record with ID: ${id}`, request.error)
          // Keep going even if one record fails
        }
      })
    })
  }

  /**
   * Paginated fetch using a cursor.
   */
  private paginatedFetch (db: IDBDatabase, page: number, recordsPerPage: number): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly')
      const store = tx.objectStore(this.storeName)
      const results: T[] = []
      const cursorRequest = store.openCursor()
      let skipCount = (page - 1) * recordsPerPage
      let count = 0

      tx.oncomplete = () => {
        db.close()
        resolve(results)
      }

      tx.onerror = () => {
        db.close()
        reject(tx.error)
      }

      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (!cursor) return

        if (skipCount > 0) {
          skipCount--
          cursor.continue()
          return
        }

        results.push(cursor.value)
        count++

        if (count < recordsPerPage) {
          cursor.continue()
        }
      }

      cursorRequest.onerror = () => {
        console.error('Error with cursor request:', cursorRequest.error)
        reject(cursorRequest.error)
      }
    })
  }

  /**
   * Fetch all records without pagination.
   */
  private fetchAll (db: IDBDatabase): Promise<T[]> {
    return new Promise((resolve, reject) => {
      let results: T[] = []
      const tx = db.transaction(this.storeName, 'readonly')
      const store = tx.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        // Temporarily store the data until the transaction completes
        results = request.result
      }

      request.onerror = () => {
        reject(request.error)
      }

      tx.oncomplete = () => {
        db.close()
        resolve(results)
      }

      tx.onerror = () => {
        db.close()
        reject(tx.error)
      }
    })
  }

  /**
   * Perform multiple updates in one transaction.
   */
  async bulkUpdate (forms: { [id: string]: Partial<Form<InstanceType<T>>> }): Promise<void> {
    const db = await this.ensureDbExists()

    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite')
      const store = tx.objectStore(this.storeName)
      const ids = Object.keys(forms)

      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => {
        db.close()
        reject(`Transaction failed: ${tx.error}`)
      }

      // For each ID, fetch the record and update it (if it exists)
      ids.forEach((id) => {
        const getRequest = store.get(id)
        getRequest.onsuccess = () => {
          const existingRecord = getRequest.result
          if (existingRecord) {
            const updatedRecord = clone({ ...existingRecord, ...forms[id] })
            store.put(updatedRecord)
          } else {
            console.warn(`Record with id ${id} not found. Skipping.`)
          }
        }
        getRequest.onerror = () => {
          console.warn(`Failed to fetch record with id ${id}. Skipping.`)
        }
      })
    })
  }
}

/**
 * Factory function to create a ModelRepo instance.
 */
export function createIndexedDbRepo<T extends typeof Model> (
  ModelClass: T,
  options?: { prefix?: string },
) {
  const prefix = options?.prefix ?? ''
  return new ModelRepo<T>(ModelClass, prefix)
}
