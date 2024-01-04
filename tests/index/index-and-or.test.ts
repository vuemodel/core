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

  it('can filter resources with an "or" grouping', async () => {
    await setups.populateRecords('posts', 15)

    const response = await index(Post, {
      filters: {
        body: {
          contains: 'est',
        },
        or: [
          {
            created_at: {
              greaterThan: '2023-08-02',
            },
          },
          {
            user_id: {
              equals: '1',
            },
          },
        ],
      },
    })

    expect(response.records?.length).toEqual(7)
    const expectedIds = ['1', '2', '3', '5', '6', '9', '11']
    expect(response.records.map(val => val.id)).toEqual(expect.arrayContaining(expectedIds))
  })

  it('can filter resources with an "and" grouping', async () => {
    await setups.populateRecords('posts', 15)

    const response = await index(Post, {
      filters: {
        created_at: {
          greaterThan: '2023-05-02',
        },
        and: [
          {
            body: {
              contains: 'est',
            },
          },
          {
            title: {
              contains: 're',
            },
          },
        ],
      },
    })

    expect(response.records.length).toEqual(2)
    const expectedIds = ['6', '9']
    expect(response.records.map(val => val.id)).toEqual(expect.arrayContaining(expectedIds))
  })
})
