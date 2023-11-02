import { describe, beforeEach, it, expect, vi } from 'vitest'
import { useIndexResources } from '@vuemodel/core'
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage'
import { Post, User } from 'sample-data'
import { populateRecords } from '../helpers/populateRecords'
import { useRepo } from 'pinia-orm'
import { baseSetup } from '../baseSetup'

describe('useIndexResources', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('persists the records to the store after index()', async () => {
    await populateRecords('posts', 3)
    const postsRepo = useRepo(Post)

    const indexer = useIndexResources(Post, { persist: false })
    await indexer.index()

    expect(postsRepo.all().length).toEqual(0)
  })

  it('does not persist the records to the store after index() when "persist" is false', async () => {
    await populateRecords('posts', 3)
    const postsRepo = useRepo(Post)

    const indexer = useIndexResources(Post)
    await indexer.index()

    expect(postsRepo.all().length).toEqual(3)
    expect(postsRepo.query().where('title', 'qui est esse').first())
      .toHaveProperty('body', 'est rerum tempore vitae\nnsequi sint nihil reprehenderit dolor beatae ea dolores neque\nnfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nnqui aperiam non debitis possimus qui neque nisi nulla')
  })

  it('can index resources immediately', async () => {
    await populateRecords('posts', 15)

    const indexer = useIndexResources(Post, { immediate: true })

    await vi.waitUntil(() => {
      return indexer.records.value?.length > 0
    })

    expect(indexer.records.value.length).greaterThan(0)
  })

  it('sets validation errors when the response has validation errors', async () => {
    const postsIndexer = useIndexResources(Post)
    piniaLocalStorageState.mockValidationErrors = {
      'title[0]': ['title must be a string'],
    }

    await postsIndexer.index()

    expect(postsIndexer.validationErrors.value['title[0]'])
      .toEqual(expect.arrayContaining(['title must be a string']))
  })

  it('clears validation errors when a request is made', async () => {
    const postsIndexer = useIndexResources(Post)
    piniaLocalStorageState.mockValidationErrors = {
      'title[0]': ['title must be a string'],
    }
    piniaLocalStorageState.mockLatencyMs = 200

    await postsIndexer.index()

    expect(postsIndexer.validationErrors.value['title[0]'])
      .toEqual(expect.arrayContaining(['title must be a string']))

    postsIndexer.index() // intentionally not awaited
    expect(postsIndexer.validationErrors.value)
      .toEqual({})
  })

  it('sets standard errors when the response has standard errors', async () => {
    const postsIndexer = useIndexResources(Post)
    piniaLocalStorageState.mockStandardErrors = [{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }]

    await postsIndexer.index()

    expect(postsIndexer.standardErrors.value[0])
      .toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })
  })

  it('clears standard errors when a request is made', async () => {
    const postsIndexer = useIndexResources(Post)
    piniaLocalStorageState.mockStandardErrors = [{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }]

    await postsIndexer.index()

    expect(postsIndexer.standardErrors.value[0])
      .toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })

    postsIndexer.index() // intentionally not awaited
    expect(postsIndexer.standardErrors.value)
      .toEqual([])
  })

  it('success and error responses have an "action" of "index"', async () => {
    const postsIndexer = useIndexResources(Post)
    piniaLocalStorageState.mockStandardErrors = [{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }]

    await postsIndexer.index()

    expect(postsIndexer.response.value.action)
      .toEqual('index')

    piniaLocalStorageState.mockStandardErrors = []
    await postsIndexer.index()

    expect(postsIndexer.response.value.action)
      .toEqual('index')
  })

  it('contains included data in "indexer.record.value"', async () => {
    await populateRecords('users', 2)
    await populateRecords('posts', 15)
    await populateRecords('comments', 63)

    const postIndexer = useIndexResources(User, {
      includes: { posts: { comments: {} } },
    })
    await postIndexer.index()

    expect(postIndexer.records.value[1].posts[2].comments.length).toBe(3)
  })

  it('exposes "makeQuery" so dev can make their own query', async () => {
    await populateRecords('users', 2)
    await populateRecords('posts', 20)
    await populateRecords('comments', 80)

    const usersIndexer = useIndexResources(User)
    await usersIndexer.index()

    const postIndexer = useIndexResources(Post, {
      includes: { comments: {} },
    })
    await postIndexer.index()

    const postsWithUser = postIndexer.makeQuery()
      .with('user')
      .get()

    expect(postsWithUser[0].user).toHaveProperty('name', 'Leanne Graham')
    expect(postsWithUser[0].comments[2]).toHaveProperty('name', 'odio adipisci rerum aut animi')
  })

  it('can filter nested records and get a filtered response', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 1)
    await populateRecords('comments', 3)

    const usersIndexer = useIndexResources(User, {
      includes: {
        posts: {
          comments: {
            email: { equals: 'Jayne_Kuhic@sydney.com' },
          },
        },
      },
    })

    await usersIndexer.index()

    expect(usersIndexer.response.value.records[0].posts[0].comments.length).toBe(1)
  })

  it('can filter nested records and get a filtered record', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 1)
    await populateRecords('comments', 3)

    const usersIndexer = useIndexResources(User, {
      includes: {
        posts: {
          comments: {
            email: { equals: 'Jayne_Kuhic@sydney.com' },
          },
        },
      },
    })

    await usersIndexer.index()

    expect(usersIndexer.records.value[0].posts[0].comments.length).toBe(1)
  })

  it('can sort nested records and get a sorted response', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 1)
    await populateRecords('comments', 3)

    const usersIndexer = useIndexResources(User, {
      includes: {
        posts: {
          comments: {
            _sortBy: [{ field: 'name', direction: 'descending' }],
          },
        },
      },
    })
    await usersIndexer.index()

    expect(usersIndexer.response.value.records[0].posts[0].comments.map(post => post.id))
      .toMatchObject([
        '2',
        '3',
        '1',
      ])
  })

  it('can sort nested records get sorted records', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 1)
    await populateRecords('comments', 3)

    const usersIndexer = useIndexResources(User, {
      includes: {
        posts: {
          comments: {
            _sortBy: [{ field: 'name', direction: 'descending' }],
          },
        },
      },
    })
    await usersIndexer.index()

    expect(usersIndexer.records.value[0].posts[0].comments.map(post => post.id))
      .toMatchObject([
        '2',
        '3',
        '1',
      ])
  })
})
