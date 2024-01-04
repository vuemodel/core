import { describe, beforeEach, it, expect } from 'vitest'
import { index } from '@vuemodel/core'
import { Post, User, populateRecords } from '@vuemodel/sample-data'
import { baseSetup } from '../baseSetup'
import { implementationSetupsMap } from '../implementations/implementationSetupsMap'

const setups = implementationSetupsMap[import.meta.env.IMPLEMENTATION ?? 'piniaLocalStorage']

describe('index', () => {
  beforeEach(async (ctx) => {
    await baseSetup(ctx)
  })

  it('can filter resources via "equals"', async () => {
    await setups.populateRecords('posts', 10)

    const response = await index(Post, {
      filters: {
        title: { equals: 'eum et est occaecati' },
      },
    })

    expect(response.records[0].title).toEqual('eum et est occaecati')
    expect(response.records.length).toEqual(1)
  })

  it('can filter resources via "doesNotEqual"', async () => {
    await setups.populateRecords('posts', 10)

    const response = await index(Post, {
      filters: {
        title: { doesNotEqual: 'eum et est occaecati' },
      },
    })

    const postThatShouldNotExist = response.records.find(post => {
      return post.title === 'eum et est occaecati'
    })

    expect(postThatShouldNotExist).toBeUndefined()
    expect(response.records.length).toEqual(9)
  })

  it('can filter resources via "lessThan"', async () => {
    await setups.populateRecords('users', 10)

    const response = await index(User, {
      filters: {
        age: { lessThan: 18 },
      },
    })

    expect(response.records.length).toEqual(4)
  })

  it('can filter resources via "lessThanOrEqual"', async () => {
    await setups.populateRecords('users', 10)

    const response = await index(User, {
      filters: {
        age: { lessThanOrEqual: 14 },
      },
    })

    expect(response.records.length).toEqual(4)
  })

  it('can filter resources via "greaterThan"', async () => {
    await setups.populateRecords('users', 10)

    const response = await index(User, {
      filters: {
        age: { greaterThan: 41 },
      },
    })

    expect(response.records.length).toEqual(3)
  })

  it('can filter resources via "greaterThanOrEqual"', async () => {
    await setups.populateRecords('users', 10)

    const response = await index(User, {
      filters: {
        age: { greaterThanOrEqual: 41 },
      },
    })

    expect(response.records.length).toEqual(4)
  })

  it('can filter resources via "in"', async () => {
    await setups.populateRecords('users', 10)

    const response = await index(User, {
      filters: {
        age: {
          in: [
            27,
            73,
            // 0 does not exist
            0,
          ],
        },
      },
    })

    expect(response.records.length).toEqual(2)
  })

  it('can filter resources via "notIn"', async () => {
    await setups.populateRecords('users', 10)

    const response = await index(User, {
      filters: {
        age: {
          notIn: [
            27,
            73,
            // 0 does not exist
            0,
          ],
        },
      },
    })

    expect(response.records.length).toEqual(8)
  })

  it('can filter resources via "contains"', async () => {
    await setups.populateRecords('posts', 20)

    const response = await index(Post, {
      filters: {
        title: { contains: 'est' },
      },
    })

    expect(response.records.length).toEqual(8)
    expect(response.records[0].title).toContain('est')
    expect(response.records[1].title).toContain('est')
    expect(response.records[2].title).toContain('est')
  })

  it('can filter resources via "doesNotContain"', async () => {
    await setups.populateRecords('posts', 20)

    const response = await index(Post, {
      filters: {
        title: { doesNotContain: 'est' },
      },
    })

    expect(response.records.length).toEqual(12)
    expect(response.records[0].title).not.toContain('est')
    expect(response.records[1].title).not.toContain('est')
    expect(response.records[2].title).not.toContain('est')
  })

  it('can filter resources via "between" using numbers', async () => {
    await setups.populateRecords('users', 10)

    const response = await index(User, {
      filters: {
        age: { between: [30, 55] },
      },
    })

    expect(response.records.length).toEqual(3)
  })

  it('can filter resources via "between" using dates', async () => {
    await setups.populateRecords('posts', 50)

    const response = await index(Post, {
      filters: {
        created_at: {
          between: [
            new Date('2023-02-16T07:55:59.107Z'),
            new Date('2023-05-23T07:55:59.107Z'),
          ],
        },
      },
    })

    expect(response.records.length).toEqual(11)
  })

  it('can filter resources via "startsWith"', async () => {
    await setups.populateRecords('posts', 50)

    const response = await index(Post, {
      filters: {
        body: { startsWith: 'est' },
      },
    })

    expect(response.records.length).toEqual(2)
  })

  it('can filter resources via "endsWith"', async () => {
    await setups.populateRecords('posts', 80)

    const response = await index(Post, {
      filters: {
        body: { endsWith: 'odio' },
      },
    })

    expect(response.records.length).toEqual(2)
  })

  it('can order by a given field', async () => {
    await setups.populateRecords('posts', 5)

    const response = await index(Post, {
      orderBy: [
        { field: 'title', direction: 'ascending' },
      ],
    })

    expect(response.records.map(val => val.id))
      .toMatchObject([
        '3', '4', '5', '2', '1',
      ])
  })
})
