import { describe, beforeEach, it, expect } from 'vitest'
import { baseSetup } from '../baseSetup'
import { useIndexer } from '@vuemodel/core'
import { User, populateRecords } from '@vuemodel/sample-data'
import { useRepo } from 'pinia-orm'
import { driverSetupsMap } from '../drivers/driverSetupsMap'

const setups = driverSetupsMap[import.meta.env.IMPLEMENTATION ?? 'piniaLocalStorage']

describe('useUpdater', () => {
  beforeEach(async (ctx) => {
    if (import.meta.env.IMPLEMENTATION !== 'piniaLocalStorage') {
      ctx.skip()
      return
    }
    await baseSetup(ctx)
  })

  it('isolates the backend store from the frontend store', async () => {
    await setups.populateRecords('users', 2)
    await useIndexer(User, { persist: false }).index()

    expect(useRepo(User).all().length).toEqual(0)
  })
})
