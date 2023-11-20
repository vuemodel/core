import { describe, beforeEach, it, expect } from 'vitest'
import { baseSetup } from '../baseSetup'
import { useIndexer } from '@vuemodel/core'
import { User, populateRecords } from '@vuemodel/sample-data'
import { useRepo } from 'pinia-orm'

describe('useUpdater', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('isolates the backend store from the frontend store', async () => {
    await populateRecords('users', 2)
    await useIndexer(User, { persist: false }).index()

    expect(useRepo(User).all().length).toEqual(0)
  })
})
