import { describe, beforeEach, it, expect } from 'vitest'
import { indexResources } from '@vuemodel/core'
import { Post, User } from '@vuemodel/sample-data'
import { populateRecords } from '../helpers/populateRecords'
import { baseSetup } from '../baseSetup'

describe('indexResources', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('can filter resources via "equals"', async () => {
    await populateRecords('posts', 10)

    const response = await indexResources(Post, {
      filters: {
        title: { equals: 'eum et est occaecati' },
      },
    })

    expect(response.records[0].title).toEqual('eum et est occaecati')
    expect(response.records.length).toEqual(1)
  })

  it('can filter resources via "doesNotEqual"', async () => {
    await populateRecords('posts', 10)

    const response = await indexResources(Post, {
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
    await populateRecords('users', 10)

    const response = await indexResources(User, {
      filters: {
        age: { lessThan: 18 },
      },
    })

    expect(response.records.length).toEqual(4)
  })

  it('can filter resources via "lessThanOrEqual"', async () => {
    await populateRecords('users', 10)

    const response = await indexResources(User, {
      filters: {
        age: { lessThanOrEqual: 14 },
      },
    })

    expect(response.records.length).toEqual(4)
  })

  it('can filter resources via "greaterThan"', async () => {
    await populateRecords('users', 10)

    const response = await indexResources(User, {
      filters: {
        age: { greaterThan: 41 },
      },
    })

    expect(response.records.length).toEqual(3)
  })

  it('can filter resources via "greaterThanOrEqual"', async () => {
    await populateRecords('users', 10)

    const response = await indexResources(User, {
      filters: {
        age: { greaterThanOrEqual: 41 },
      },
    })

    expect(response.records.length).toEqual(4)
  })

  it('can filter resources via "in"', async () => {
    await populateRecords('users', 10)

    const response = await indexResources(User, {
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
    await populateRecords('users', 10)

    const response = await indexResources(User, {
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
    await populateRecords('posts', 20)

    const response = await indexResources(Post, {
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
    await populateRecords('posts', 20)

    const response = await indexResources(Post, {
      filters: {
        title: { doesNotContain: 'est' },
      },
    })

    expect(response.records.length).toEqual(12)
    expect(response.records[0].title).not.toContain('est')
    expect(response.records[1].title).not.toContain('est')
    expect(response.records[2].title).not.toContain('est')
  })

  it('can filter resources via "between" using strings', async () => {
    await populateRecords('users', 10)

    const response = await indexResources(User, {
      filters: {
        id: { between: [1, 5] },
      },
    })

    expect(response.records.length).toEqual(5)
  })

  it('can filter resources via "between" using numbers', async () => {
    await populateRecords('users', 10)

    const response = await indexResources(User, {
      filters: {
        age: { between: [30, 55] },
      },
    })

    expect(response.records.length).toEqual(3)
  })

  it('can filter resources via "between" using dates', async () => {
    await populateRecords('posts', 50)

    const response = await indexResources(Post, {
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
    await populateRecords('posts', 50)

    const response = await indexResources(Post, {
      filters: {
        body: { startsWith: 'est' },
      },
    })

    expect(response.records.length).toEqual(2)
  })

  it('can filter resources via "endsWith"', async () => {
    await populateRecords('posts', 80)

    const response = await indexResources(Post, {
      filters: {
        body: { endsWith: 'odio' },
      },
    })

    expect(response.records.length).toEqual(2)
  })

  it('can sort by a given field', async () => {
    await populateRecords('posts', 5)

    const response = await indexResources(Post, {
      sortBy: [
        { field: 'title', direction: 'ascending' },
      ],
    })

    expect(response.records.map(val => val.id))
      .toMatchObject([
        '3', '4', '5', '2', '1',
      ])
  })
})
