import { describe, beforeEach, it, expect, vi } from 'vitest'
import { useFindResource, UseFindResourceOptions } from '@vuemodel/core'
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage'
import { populateRecords } from '../helpers/populateRecords'
import { Post, User } from 'sample-data'
import { useRepo } from 'pinia-orm'
import { baseSetup } from '../baseSetup'

describe('useFindResource', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('persists the record to the store after find()', async () => {
    await populateRecords('posts', 5)

    const postFinder = useFindResource(Post)
    await postFinder.find('1')

    expect(postFinder.record.value.title).toEqual('sunt aut facere repellat provident occaecati excepturi optio reprehenderit')
  })

  it('does not persist the record to the store after find() when "persist" is false', async () => {
    await populateRecords('posts', 5)

    const postRepo = useRepo(Post)
    const postFinder = useFindResource(Post, { persist: false })

    await postFinder.find('1')

    const post = postRepo.find(postFinder.response.value.record?.id)
    expect(post).toBeNull()
  })

  it('can find a resource by "id" using finder(id)', async () => {
    await populateRecords('posts', 5)

    const postFinder = useFindResource(Post)
    await postFinder.find('1')

    expect(postFinder.record.value)
      .toHaveProperty('title', 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit')
  })

  it('can find a resource using the option "options.id"', async () => {
    await populateRecords('posts', 5)

    const postFinder = useFindResource(Post, { id: '2' })
    await postFinder.find()

    expect(postFinder.record.value)
      .toHaveProperty('title', 'qui est esse')
  })

  it('uses the correct precedence when finding by id', async () => {
    await populateRecords('posts', 5)

    const postFinder = useFindResource(Post, { id: '2' })
    await postFinder.find('1')

    expect(postFinder.record.value)
      .toHaveProperty('title', 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit')
  })

  it('can find the resource immediately', async () => {
    await populateRecords('posts', 5)

    const postFinder = useFindResource(Post, { id: '2', immediate: true })

    await vi.waitUntil(() => !postFinder.finding.value)

    expect(postFinder.record.value)
      .toHaveProperty('title', 'qui est esse')
  })

  it('hits the "onSuccess" callback on success', async () => {
    await populateRecords('posts', 5)
    const options: UseFindResourceOptions<typeof Post> = {
      id: '2',
      onSuccess () {
        return true
      },
    }
    const onSuccessSpy = vi.spyOn(options, 'onSuccess')

    const postFinder = useFindResource(Post, options)
    await postFinder.find()

    expect(onSuccessSpy).toHaveBeenCalled()
  })

  it('hits the "onError" callback when there is a standard error', async () => {
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]
    const options: UseFindResourceOptions<typeof Post> = {
      id: '2',
      onError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onError')

    const postFinder = useFindResource(Post, options)
    await postFinder.find()

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('hits the "onError" callback when there is a validation error', async () => {
    piniaLocalStorageState.mockValidationErrors = {
      title: ['title is required'],
    }
    const options: UseFindResourceOptions<typeof Post> = {
      id: '2',
      onError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onError')

    const postFinder = useFindResource(Post, options)
    await postFinder.find()

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('hits the "onStandardError" callback when there are one or more standard errors', async () => {
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]
    const options: UseFindResourceOptions<typeof Post> = {
      id: '2',
      onStandardError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onStandardError')

    const postFinder = useFindResource(Post, options)
    await postFinder.find()

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('hits the "onValidationError" callback when there are one or more validation errors', async () => {
    piniaLocalStorageState.mockValidationErrors = {
      title: ['title is required'],
    }
    const options: UseFindResourceOptions<typeof Post> = {
      id: '2',
      onValidationError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onValidationError')

    const postFinder = useFindResource(Post, options)
    await postFinder.find()

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('has a "finding" value of the resources id while finding', async () => {
    await populateRecords('posts', 1)
    piniaLocalStorageState.mockLatencyMs = 200

    const postFinder = useFindResource(Post)
    postFinder.find('1')

    expect(postFinder.finding.value).toBe('1')
    await vi.waitUntil(() => !postFinder.finding.value)
    expect(postFinder.finding.value).toBe(undefined)
  })

  it('can access the record via "finder.record.value" after finding it', async () => {
    await populateRecords('posts', 1)
    const postRepo = useRepo(Post)

    const postFinder = useFindResource(Post)
    postFinder.find('1')

    expect(postFinder.record.value).toBe(postRepo.find('1'))
  })

  it('exposes "makeQuery" so dev can make their own query', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 1)
    await populateRecords('comments', 3)

    const userFinder = useFindResource(User)
    await userFinder.find('1')

    const postFinder = useFindResource(Post, {
      includes: { comments: {} },
    })
    await postFinder.find('1')

    const postQueryWithUser = postFinder.makeQuery()
      .with('user')
    expect(postQueryWithUser.first().user).toHaveProperty('name', 'Leanne Graham')
  })

  it('contains included data in "finder.record.value"', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 1)
    await populateRecords('comments', 3)

    const userFinder = useFindResource(User, {
      includes: { posts: { comments: {} } },
    })
    await userFinder.find('1')

    expect(userFinder.record.value.posts[0]).toHaveProperty('title', 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit')
    expect(userFinder.record.value.posts[0].comments.length).toBe(3)
  })

  it('can filter nested records and get a filtered response', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 1)
    await populateRecords('comments', 3)

    const userFinder = useFindResource(User, {
      includes: { posts: { comments: { email: { equals: 'Jayne_Kuhic@sydney.com' } } } },
    })
    await userFinder.find('1')

    expect(userFinder.response.value.record.posts[0].comments.length).toBe(1)
  })

  it('can filter nested records and get a filtered record', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 1)
    await populateRecords('comments', 3)

    const userFinder = useFindResource(User, {
      includes: { posts: { comments: { email: { equals: 'Jayne_Kuhic@sydney.com' } } } },
    })
    await userFinder.find('1')

    expect(userFinder.record.value.posts[0].comments.length).toBe(1)
  })

  it('can sort nested records and get a sorted response', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 1)
    await populateRecords('comments', 3)

    const userFinder = useFindResource(User, {
      includes: {
        posts: {
          comments: {
            _sortBy: [{ field: 'name', direction: 'descending' }],
          },
        },
      },
    })
    await userFinder.find('1')

    expect(userFinder.response.value.record.posts[0].comments.map(post => post.id))
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

    const userFinder = useFindResource(User, {
      includes: {
        posts: {
          comments: {
            _sortBy: [{ field: 'name', direction: 'descending' }],
          },
        },
      },
    })
    await userFinder.find('1')

    expect(userFinder.record.value.posts[0].comments.map(post => post.id))
      .toMatchObject([
        '2',
        '3',
        '1',
      ])
  })

  it('sets validation errors when the response has validation errors', async () => {
    const postsFinder = useFindResource(Post)
    piniaLocalStorageState.mockValidationErrors = {
      'title[0]': ['title must be a string'],
    }

    await postsFinder.find('1')

    expect(postsFinder.validationErrors.value['title[0]'])
      .toEqual(expect.arrayContaining(['title must be a string']))
  })

  it('clears validation errors when a request is made', async () => {
    const postsFinder = useFindResource(Post)
    piniaLocalStorageState.mockValidationErrors = {
      'title[0]': ['title must be a string'],
    }
    piniaLocalStorageState.mockLatencyMs = 200

    await postsFinder.find('1')

    expect(postsFinder.validationErrors.value['title[0]'])
      .toEqual(expect.arrayContaining(['title must be a string']))

    postsFinder.find('1') // intentionally not awaited
    expect(postsFinder.validationErrors.value)
      .toEqual({})
  })

  it('sets standard errors when the response has standard errors', async () => {
    const postsFinder = useFindResource(Post)
    piniaLocalStorageState.mockStandardErrors = [{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }]

    await postsFinder.find('1')

    expect(postsFinder.standardErrors.value[0])
      .toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })
  })

  it('clears standard errors when a request is made', async () => {
    const postsFinder = useFindResource(Post)
    piniaLocalStorageState.mockStandardErrors = [{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }]

    await postsFinder.find('1')

    expect(postsFinder.standardErrors.value[0])
      .toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })

    postsFinder.find('1') // intentionally not awaited
    expect(postsFinder.standardErrors.value)
      .toEqual([])
  })

  it('success and error responses have an "action" of "find"', async () => {
    const postsFinder = useFindResource(Post)
    piniaLocalStorageState.mockStandardErrors = [{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }]

    await postsFinder.find('1')

    expect(postsFinder.response.value.action)
      .toEqual('find')

    piniaLocalStorageState.mockStandardErrors = []
    await postsFinder.find('1')

    expect(postsFinder.response.value.action)
      .toEqual('find')
  })
})
