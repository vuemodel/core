import { describe, beforeEach, it, expect } from 'vitest'
import { indexResources } from '@vuemodel/core'
import { User } from 'sample-data'
import { populateRecords } from '../helpers/populateRecords'
import { baseSetup } from '../baseSetup'

describe('indexResources', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('can include a resource', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 5)

    const response = await indexResources(User, {
      includes: {
        posts: {},
      },
    })

    expect(response.records.length).toEqual(1)
    expect(response.records[0].posts.length).toEqual(5)
  })

  it('can include multiple resources', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 5)
    await populateRecords('albums', 5)

    const response = await indexResources(User, {
      includes: {
        posts: {},
        albums: {},
      },
    })

    expect(response.records[0].posts.length).toEqual(5)
    expect(response.records[0].posts.length).toEqual(5)
    expect(response.records[0].albums.length).toEqual(5)
  })

  it('can nested include', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 5)
    await populateRecords('comments', 5)

    const response = await indexResources(User, {
      includes: {
        posts: {
          comments: {},
        },
      },
    })

    expect(response.records[0].posts.length).toEqual(5)
    expect(response.records[0].posts[0].comments.length).toEqual(5)
  })

  it('can filter nested records', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 20)

    const response = await indexResources(User, {
      includes: {
        posts: {
          title: {
            contains: 'optio',
          },
        },
      },
    })

    expect(response.records[0].posts.length).toEqual(2)
    expect(response.records[0].posts.map(post => post.id))
      .toEqual(expect.arrayContaining([
        '1',
        '10',
      ]))
  })

  it('can sort nested records', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 5)

    const response = await indexResources(User, {
      includes: {
        posts: {
          _sortBy: [
            { field: 'title', direction: 'ascending' },
          ],
        },
      },
    })

    expect(response.records[0].posts.map(post => post.id))
      .toMatchObject([
        '3',
        '4',
        '5',
        '2',
        '1',
      ])
  })

  it('can filter nested records', async () => {
    //
  })
})
