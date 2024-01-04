import { describe, beforeEach, it, expect, vi } from 'vitest'
import { useFinder, UseFinderOptions, vueModelState } from '@vuemodel/core'
import { DataverseUser, PhotoTag, Post, User } from '@vuemodel/sample-data'
import { useRepo } from 'pinia-orm'
import { baseSetup } from '../baseSetup'
import { wait } from '../helpers/wait'
import { promiseState } from '../helpers/promiseState'
import { implementationSetupsMap } from '../implementations/implementationSetupsMap'

const setups = implementationSetupsMap[import.meta.env.IMPLEMENTATION ?? 'piniaLocalStorage']

describe('useFinder', () => {
  beforeEach(async (ctx) => {
    await baseSetup(ctx)
  })

  it('persists the record to the store after find()', async () => {
    await setups.populateRecords('posts', 5)

    const postFinder = useFinder(Post)
    await postFinder.find('1')

    expect(postFinder.record.value.title).toEqual('sunt aut facere repellat provident occaecati excepturi optio reprehenderit')
  })

  it('does not persist the record to the store after find() when "persist" is false', async () => {
    await setups.populateRecords('posts', 5)

    const postRepo = useRepo(Post)
    const postFinder = useFinder(Post, { persist: false })

    await postFinder.find('1')

    const post = postRepo.find(postFinder.response.value.record?.id)
    expect(post).toBeNull()
  })

  it('can find a resource by "id" using finder(id)', async () => {
    await setups.populateRecords('posts', 5)

    const postFinder = useFinder(Post)
    await postFinder.find('1')

    expect(postFinder.record.value)
      .toHaveProperty('title', 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit')
  })

  it('can find a resource using the option "options.id"', async () => {
    await setups.populateRecords('posts', 5)

    const postFinder = useFinder(Post, { id: '2' })
    await postFinder.find()

    expect(postFinder.record.value)
      .toHaveProperty('title', 'qui est esse')
  })

  it('uses the correct precedence when finding by id', async () => {
    await setups.populateRecords('posts', 5)

    const postFinder = useFinder(Post, { id: '2' })
    await postFinder.find('1')

    expect(postFinder.record.value)
      .toHaveProperty('title', 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit')
  })

  it('can find the resource immediately', async () => {
    await setups.populateRecords('posts', 5)

    const postFinder = useFinder(Post, { id: '2', immediate: true })

    await vi.waitUntil(() => !postFinder.finding.value)

    expect(postFinder.record.value)
      .toHaveProperty('title', 'qui est esse')
  })

  it('can set immediate globally', async () => {
    //
  })

  it('hits the "onSuccess" callback on success', async () => {
    await setups.populateRecords('posts', 5)
    const options: UseFinderOptions<typeof Post> = {
      id: '2',
      onSuccess () {
        return true
      },
    }
    const onSuccessSpy = vi.spyOn(options, 'onSuccess')

    const postFinder = useFinder(Post, options)
    await postFinder.find()

    expect(onSuccessSpy).toHaveBeenCalled()
  })

  it('hits the "onError" callback when there is a standard error', async () => {
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])
    const options: UseFinderOptions<typeof Post> = {
      id: '2',
      onError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onError')

    const postFinder = useFinder(Post, options)
    await postFinder.find()

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('hits the "onError" callback when there is a validation error', async () => {
    setups.setMockValidationErrors({
      title: ['title is required'],
    })
    const options: UseFinderOptions<typeof Post> = {
      id: '2',
      onError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onError')

    const postFinder = useFinder(Post, options)
    await postFinder.find()

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('hits the "onStandardError" callback when there are one or more standard errors', async () => {
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])
    const options: UseFinderOptions<typeof Post> = {
      id: '2',
      onStandardError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onStandardError')

    const postFinder = useFinder(Post, options)
    await postFinder.find()

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('hits the "onValidationError" callback when there are one or more validation errors', async () => {
    setups.setMockValidationErrors({
      title: ['title is required'],
    })
    const options: UseFinderOptions<typeof Post> = {
      id: '2',
      onValidationError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onValidationError')

    const postFinder = useFinder(Post, options)
    await postFinder.find()

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('has a "finding" value of the resources id while finding', async () => {
    await setups.populateRecords('posts', 1)
    setups.setMockLatency(200)

    const postFinder = useFinder(Post)
    postFinder.find('1')

    expect(postFinder.finding.value).toBe('1')
    await vi.waitUntil(() => !postFinder.finding.value)
    expect(postFinder.finding.value).toBe(false)
  })

  it('can access the record via "finder.record.value" after finding it', async () => {
    await setups.populateRecords('posts', 1)
    const postRepo = useRepo(Post)

    const postFinder = useFinder(Post)
    postFinder.find('1')

    expect(postFinder.record.value).toBe(postRepo.find('1'))
  })

  it('exposes "makeQuery" so dev can make their own query', async () => {
    await setups.populateRecords('users', 1)
    await setups.populateRecords('posts', 1)
    await setups.populateRecords('comments', 3)

    const userFinder = useFinder(User)
    await userFinder.find('1')

    const postFinder = useFinder(Post, {
      with: { comments: {} },
    })
    await postFinder.find('1')

    const postQueryWithUser = postFinder.makeQuery()
      .with('user')
    expect(postQueryWithUser.first().user).toHaveProperty('name', 'Leanne Graham')
  })

  it('contains populated data in "finder.record.value"', async () => {
    await setups.populateRecords('users', 1)
    await setups.populateRecords('posts', 1)
    await setups.populateRecords('comments', 3)

    const userFinder = useFinder(User, {
      with: { posts: { comments: {} } },
    })
    await userFinder.find('1')

    expect(userFinder.record.value.posts[0]).toHaveProperty('title', 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit')
    expect(userFinder.record.value.posts[0].comments.length).toBe(3)
  })

  it('can filter nested records and get a filtered response', async () => {
    await setups.populateRecords('users', 1)
    await setups.populateRecords('posts', 1)
    await setups.populateRecords('comments', 3)

    const userFinder = useFinder(User, {
      with: { posts: { comments: { email: { equals: 'Jayne_Kuhic@sydney.com' } } } },
    })
    await userFinder.find('1')

    expect(userFinder.response.value.record.posts[0].comments.length).toBe(1)
  })

  it('can filter nested records and get a filtered record', async () => {
    await setups.populateRecords('users', 1)
    await setups.populateRecords('posts', 1)
    await setups.populateRecords('comments', 3)

    const userFinder = useFinder(User, {
      with: { posts: { comments: { email: { equals: 'Jayne_Kuhic@sydney.com' } } } },
    })
    await userFinder.find('1')

    expect(userFinder.record.value.posts[0].comments.length).toBe(1)
  })

  it('can order nested records and get a ordered response', async () => {
    if (!setups.implementation.features.find.order.nested) {
      const consoleMock = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      const userFinder = useFinder(User, {
        with: {
          posts: {
            comments: {
              _orderBy: [{ field: 'name', direction: 'descending' }],
            },
          },
        },
      })
      await userFinder.find('1')
      expect(consoleMock).toHaveBeenCalledWith('implementation "testDriver" does not support feature "find.order.nested"')
      return
    }

    await setups.populateRecords('users', 1)
    await setups.populateRecords('posts', 1)
    await setups.populateRecords('comments', 3)

    const userFinder = useFinder(User, {
      with: {
        posts: {
          comments: {
            _orderBy: [{ field: 'name', direction: 'descending' }],
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

  it('can order nested records, and get ordered records from the store', async () => {
    if (!setups.implementation.features.find.order.nested) {
      const consoleMock = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      const userFinder = useFinder(User, {
        with: {
          posts: {
            comments: {
              _orderBy: [{ field: 'name', direction: 'descending' }],
            },
          },
        },
      })
      await userFinder.find('1')
      expect(consoleMock).toHaveBeenCalledWith('implementation "testDriver" does not support feature "find.order.nested"')
      return
    }

    await setups.populateRecords('users', 1)
    await setups.populateRecords('posts', 1)
    await setups.populateRecords('comments', 3)

    const userFinder = useFinder(User, {
      with: {
        posts: {
          comments: {
            _orderBy: [{ field: 'name', direction: 'descending' }],
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
    const postsFinder = useFinder(Post)
    setups.setMockValidationErrors({
      'title[0]': ['title must be a string'],
    })

    await postsFinder.find('1')

    expect(postsFinder.validationErrors.value['title[0]'])
      .toEqual(expect.arrayContaining(['title must be a string']))
  })

  it('clears validation errors when a request is made', async () => {
    const postsFinder = useFinder(Post)
    setups.setMockValidationErrors({
      'title[0]': ['title must be a string'],
    })
    setups.setMockLatency(200)

    await postsFinder.find('1')

    expect(postsFinder.validationErrors.value['title[0]'])
      .toEqual(expect.arrayContaining(['title must be a string']))

    postsFinder.find('1') // intentionally not awaited
    expect(postsFinder.validationErrors.value)
      .toEqual({})
  })

  it('sets standard errors when the response has standard errors', async () => {
    const postsFinder = useFinder(Post)
    setups.setMockStandardErrors([{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }])

    await postsFinder.find('99')

    expect(postsFinder.standardErrors.value[0].message)
      .toBeTypeOf('string')
  })

  it('clears standard errors when a request is made', async () => {
    const postsFinder = useFinder(Post)
    setups.setMockStandardErrors([{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }])

    await postsFinder.find('99')

    expect(postsFinder.standardErrors.value[0].message)
      .toBeTypeOf('string')

    postsFinder.find('99') // intentionally not awaited
    expect(postsFinder.standardErrors.value)
      .toEqual([])
  })

  it('success and error responses have an "action" of "find"', async () => {
    const postsFinder = useFinder(Post)
    setups.setMockStandardErrors([{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }])

    await postsFinder.find('1')

    expect(postsFinder.response.value.action)
      .toEqual('find')

    setups.setMockStandardErrors([])
    await postsFinder.find('1')

    expect(postsFinder.response.value.action)
      .toEqual('find')
  })

  it('can persist by "insert"', async () => {
    await setups.populateRecords('users', 1)
    await setups.populateRecords('posts', 5)

    const userFinder = useFinder(User, {
      with: { posts: {} },
      id: '1',
      persistBy: 'insert',
    })
    await userFinder.find()

    expect(userFinder.record.value.posts.length).toEqual(0)
  })

  // ------------

  it('applys scope filters', async () => {
    await setups.populateRecords('users', 1)
    await setups.populateRecords('posts', 10)
    vueModelState.config.scopes = {
      defaultTenant: {
        filters: {
          tenant_id: {
            equals: '1',
          },
        },
      },
    }
    vueModelState.config.globallyAppliedScopes = ['defaultTenant']

    const usersFinder = useFinder(User, {
      id: '1',
      with: { posts: {} },
    })
    await usersFinder.find()

    expect(usersFinder.record.value.posts.length).toEqual(7)
  })

  it('can order in a scope', async () => {
    await setups.populateRecords('users', 1)
    await setups.populateRecords('posts', 10)
    vueModelState.drivers.testDriver.config.entityScopes = {
      posts: {
        orderByTitle: {
          orderBy: [
            { field: 'title', direction: 'ascending' },
          ],
        },
      },
    }
    vueModelState.config.globallyAppliedEntityScopes = { posts: ['orderByTitle'] }

    const usersFinder = useFinder(User, { id: '1', with: { posts: {} } })
    await usersFinder.find()

    const posts = usersFinder.record.value.posts
    expect(posts[0].title).toEqual('dolorem dolore est ipsam')
    expect(posts[9].title).toEqual('sunt aut facere repellat provident occaecati excepturi optio reprehenderit')
  })

  it('can populate data using an array of strings syntax', async () => {
    await setups.populateRecords('users', 1)
    await setups.populateRecords('posts', 3)
    await setups.populateRecords('albums', 3)

    const userFinder = useFinder(User, {
      id: '1',
      with: ['posts', 'albums'],
    })
    await userFinder.find('1')

    expect(userFinder.record.value.posts.length).toEqual(3)
    expect(userFinder.record.value.albums.length).toEqual(3)
  })

  it('can populate data using strings, using dot notation', async () => {
    await setups.populateRecords('posts', 1)
    await setups.populateRecords('users', 1)
    await setups.populateRecords('albums', 3)

    const userFinder = useFinder(Post, {
      id: '1',
      with: ['user.albums'],
    })
    await userFinder.find()

    expect(userFinder.record.value.user.name).toEqual('Leanne Graham')
    expect(userFinder.record.value.user.albums.length).toEqual(3)
  })

  it('can populate data using a string', async () => {
    await setups.populateRecords('users', 1)
    await setups.populateRecords('posts', 3)

    const userFinder = useFinder(User, {
      id: '1',
      with: 'posts',
    })
    await userFinder.find('1')

    expect(userFinder.record.value.posts.length).toEqual(3)
  })

  it('can populate data using a string with commas', async () => {
    await setups.populateRecords('users', 1)
    await setups.populateRecords('posts', 3)
    await setups.populateRecords('albums', 3)

    const userFinder = useFinder(User, {
      id: '1',
      with: 'posts,albums',
    })
    await userFinder.find('1')

    expect(userFinder.record.value.posts.length).toEqual(3)
    expect(userFinder.record.value.albums.length).toEqual(3)
  })

  it('can find a resource with a composite key', async () => {
    await setups.populateRecords('photo_tags', 10)
    const photoTagFinder = useFinder(PhotoTag)

    await photoTagFinder.find('["4","3"]')

    expect(photoTagFinder.record.value)
      .toMatchObject({
        photo_id: '4',
        tag_id: '3',
      })
  })

  it('can pass an array to "find" to find via composite key', async () => {
    await setups.populateRecords('photo_tags', 10)
    const photoTagFinder = useFinder(PhotoTag)

    await photoTagFinder.find(['4', '3'])

    expect(photoTagFinder.record.value)
      .toMatchObject({
        photo_id: '4',
        tag_id: '3',
      })
  })

  it('can find a resource where the primaryKey is not "id"', async () => {
    await setups.populateRecords('dataverse_users', 2)
    const dataverseUserFinder = useFinder(DataverseUser)

    await dataverseUserFinder.find('2')

    expect(dataverseUserFinder.record.value.name)
      .toEqual('Ervin Howell')

    expect(dataverseUserFinder.record.value.userid)
      .toBeTruthy()
  })

  it('cancels the first request if a second request is made and the first is not done yet', async () => {
    await setups.populateRecords('posts', 10)
    setups.setMockLatency(100)

    const postsFinder = useFinder(Post)
    const findRequestA = postsFinder.find('1')
    const findRequestB = postsFinder.find('2')

    await wait(200)
    const findRequestAPromiseState = await promiseState(findRequestA)
    const findRequestBPromiseState = await promiseState(findRequestB)
    expect(findRequestAPromiseState.status).toEqual('fulfilled')
    expect(findRequestBPromiseState.status).toEqual('pending')

    await findRequestB

    expect(postsFinder.standardErrors.value.length)
      .toEqual(0)
    expect(postsFinder.record.value)
      .toBeTruthy()
  })

  it('can notify on error', async () => {
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])
    vueModelState.config.errorNotifiers = {
      find: () => {
        return ''
      },
    }

    const findErrorNotifierSpy = vi.spyOn(vueModelState.config.errorNotifiers, 'find')

    const postFinder = useFinder(User, { notifyOnError: true })
    await postFinder.find('1')

    expect(findErrorNotifierSpy).toHaveBeenCalled()
  })

  it('can cancel the request', async () => {
    //
  })
})
