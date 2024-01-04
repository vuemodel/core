import { describe, beforeEach, it, expect } from 'vitest'
import { index } from '@vuemodel/core'
import { Post, populateRecords } from '@vuemodel/sample-data'
import { baseSetup } from '../baseSetup'
import { implementationSetupsMap } from '../implementations/implementationSetupsMap'

const setups = implementationSetupsMap[import.meta.env.IMPLEMENTATION ?? 'piniaLocalStorage']

describe('index', () => {
  beforeEach(async (ctx) => {
    await baseSetup(ctx)
  })

  it('can limit number or resources returned', async () => {
    await setups.populateRecords('posts', 10)

    const response = await index(Post, {
      pagination: {
        recordsPerPage: 5,
      },
    })

    expect(response.records.length).toEqual(5)
    expect(response.pagination.recordsCount).toEqual(10)
  })

  it('can paginate', async () => {
    await setups.populateRecords('posts', 10)

    const response = await index(Post, {
      pagination: {
        recordsPerPage: 5,
        page: 2,
      },
    })

    expect(response.records.length).toEqual(5)
    expect(response.records[0].id).toEqual('6')
    expect(response.records[1].id).toEqual('7')
    expect(response.records[2].id).toEqual('8')
    expect(response.records[3].id).toEqual('9')
    expect(response.records[4].id).toEqual('10')

    expect(response.pagination.recordsCount).toEqual(10)
  })

  it('has the correct record count when paginating with filters', async () => {
    await setups.populateRecords('posts', 20)

    const response = await index(Post, {
      filters: {
        user_id: { equals: '1' },
      },
      pagination: {
        recordsPerPage: 5,
        page: 2,
      },
    })

    expect(response.pagination.recordsCount).toEqual(10)
  })

  it('sets a standard error if the page is a negative number', async () => {
    //
  })
})
