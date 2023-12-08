import { describe, beforeEach, it, expect, vi } from 'vitest'
import { baseSetup } from '../baseSetup'
import { useIndexer, useDestroyer, UseDestroyerOptions, vueModelState } from '@vuemodel/core'
import { DataverseUser, PhotoTag, Post, User, populateRecords } from '@vuemodel/sample-data'
import { useRepo } from 'pinia-orm'
import { ref } from 'vue'
import { wait } from '../helpers/wait'
import { implementationSetupsMap } from '../implementations/implementationSetupsMap'

const setups = implementationSetupsMap[import.meta.env.IMPLEMENTATION ?? 'piniaLocalStorage']

describe('useDestroyer', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('destroys the record from the store after calling destroy("some-id")', async () => {
    await populateRecords('posts', 2)
    const postsIndexer = useIndexer(Post)
    await postsIndexer.index()
    const postRepo = useRepo(Post)

    const postDestroyer = useDestroyer(Post)
    await postDestroyer.destroy('2')

    expect(postRepo.all().length).toEqual(1)
  })

  it('does not destroy the record from the store after destroy() when "persist" is false', async () => {
    const postRepo = useRepo(Post)
    await populateRecords('posts', 2)
    const postsIndexer = useIndexer(Post)
    await postsIndexer.index()

    const postDestroyer = useDestroyer(Post, { persist: false })
    await postDestroyer.destroy('2')

    expect(postRepo.all().length).toEqual(2)
  })

  it('can destroy a resource using "options.id"', async () => {
    await populateRecords('posts', 2)
    const postsIndexer = useIndexer(Post)
    await postsIndexer.index()
    const postRepo = useRepo(Post)

    const id = ref('2')
    const postDestroyer = useDestroyer(Post, { id })
    await postDestroyer.destroy()

    expect(postRepo.all().length).toEqual(1)
  })

  it('uses the correct precedence when destroying by id', async () => {
    await populateRecords('posts', 2)
    const postsIndexer = useIndexer(Post)
    await postsIndexer.index()
    const postRepo = useRepo(Post)

    const id = ref('2')
    const postDestroyer = useDestroyer(Post, { id })
    await postDestroyer.destroy('1')

    expect(postRepo.all().length).toEqual(1)
    expect(postRepo.query().first()).toHaveProperty('title', 'qui est esse')
  })

  it('has a "destroying" value of the records id while destroying', async () => {
    await populateRecords('posts', 2)
    setups.setMockLatency(150)

    const postDestroyer = useDestroyer(Post)
    const destroyPromise = postDestroyer.destroy('2')

    expect(postDestroyer.destroying.value).toEqual('2')
    await destroyPromise
    expect(postDestroyer.destroying.value).toEqual(false)
  })

  it('can access the record after destroying it', async () => {
    await populateRecords('posts', 2)
    const postDestroyer = useDestroyer(Post)
    await postDestroyer.destroy('2')

    expect(postDestroyer.record.value).toHaveProperty('title', 'qui est esse')
  })

  it('hits the "onSuccess" callback on success', async () => {
    await populateRecords('posts', 2)
    const options: UseDestroyerOptions<typeof Post> = {
      onSuccess () {
        return true
      },
    }
    const onSuccessSpy = vi.spyOn(options, 'onSuccess')

    const postDestroyer = useDestroyer(Post, options)
    await postDestroyer.destroy('2')

    expect(onSuccessSpy).toHaveBeenCalled()
  })

  it('can optimistically destroy', async () => {
    await populateRecords('posts', 2)
    const postsIndexer = useIndexer(Post)
    await postsIndexer.index()
    const postRepo = useRepo(Post)
    const postDestroyer = useDestroyer(Post, { optimistic: true })
    setups.setMockLatency(200)

    postDestroyer.destroy('1') // intentionally not awaited

    expect(postRepo.all().length).toEqual(1)
  })

  it('can set optimistic globally', async () => {
    // await populateRecords('posts', 2)
    // const postsIndexer = useIndexer(Post)
    // await postsIndexer.index()
    // const postRepo = useRepo(Post)
    // const postDestroyer = useDestroyer(Post, { optimistic: true })
    // setups.setMockLatency(200)

    // postDestroyer.destroy('1') // intentionally not awaited

    // expect(postRepo.all().length).toEqual(1)
  })

  it('rolls back if the destroy fails when using optimistic', async () => {
    await populateRecords('posts', 2)
    const postsIndexer = useIndexer(Post)
    await postsIndexer.index()
    const postRepo = useRepo(Post)

    const postDestroyer = useDestroyer(Post, { optimistic: true })

    setups.setMockStandardErrors([{ message: 'something went wrong', name: 'oops' }])
    setups.setMockLatency(200)
    const destroyPromise = postDestroyer.destroy('1') // intentionally not awaited

    expect(postRepo.all().length).toEqual(1)
    await destroyPromise
    expect(postRepo.all().length).toEqual(2)
    expect(postRepo.find('1')).toHaveProperty('created_at', '2023-01-13T07:55:59.107Z')
  })

  it('sets standard errors when the response has standard errors', async () => {
    const postDestroyer = useDestroyer(Post)
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])

    await postDestroyer.destroy('1')

    expect(postDestroyer.standardErrors.value[0])
      .toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })
  })

  it('clears standard errors when a request is made', async () => {
    await populateRecords('posts', 2)
    const postsIndexer = useIndexer(Post)
    await postsIndexer.index()

    const postDestroyer = useDestroyer(Post)
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])

    await postDestroyer.destroy('1')

    expect(postDestroyer.standardErrors.value[0])
      .toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })

    setups.setMockStandardErrors(undefined)
    await postDestroyer.destroy('2')

    expect(postDestroyer.standardErrors.value.length)
      .toEqual(0)
  })

  it('success and error responses have an "action" of "destroy"', async () => {
    const postDestroy = useDestroyer(Post)
    setups.setMockStandardErrors([{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }])

    await postDestroy.destroy('1')

    expect(postDestroy.response.value.action)
      .toEqual('destroy')

    setups.setMockStandardErrors([])
    await postDestroy.destroy('2')

    expect(postDestroy.response.value.action)
      .toEqual('destroy')
  })

  it('can destroy a resource with a composite key', async () => {
    await populateRecords('photo_tags', 10)
    const photoTagDestroyer = useDestroyer(PhotoTag)

    await photoTagDestroyer.destroy('["4","3"]')

    expect(photoTagDestroyer.record.value)
      .toMatchObject({
        photo_id: '4',
        tag_id: '3',
      })
  })

  it('can pass an array to "destroy" to destroy via composite key', async () => {
    await populateRecords('photo_tags', 10)
    const photoTagDestroyer = useDestroyer(PhotoTag)

    await photoTagDestroyer.destroy(['4', '3'])

    expect(photoTagDestroyer.record.value)
      .toMatchObject({
        photo_id: '4',
        tag_id: '3',
      })
  })

  it('can destroy a resource where the primaryKey is not "id"', async () => {
    await populateRecords('dataverse_users', 2)
    const photoTagDestroyer = useDestroyer(DataverseUser)

    await photoTagDestroyer.destroy('2')

    expect(photoTagDestroyer.record.value.name)
      .toEqual('Ervin Howell')
  })

  it('can destroy two records at the same time', async () => {
    await populateRecords('posts', 3)
    setups.setMockLatency(100)
    const postRepo = useRepo(Post)
    const postDestroyer = useDestroyer(Post)

    const destroyRequestA = postDestroyer.destroy('1')
    await wait(50)
    const destroyRequestB = postDestroyer.destroy('2')

    await Promise.all([destroyRequestA, destroyRequestB])

    expect(postRepo.all().length).toEqual(0)
  })

  it('can cancel the request', async () => {
    await populateRecords('users', 2)
    await useIndexer(User).index()
    const repo = useRepo(User)
    setups.setMockLatency(100)

    const usersDestroyer = useDestroyer(User)
    const destoryRequest = usersDestroyer.destroy('1')
    usersDestroyer.cancel()
    await destoryRequest

    expect(usersDestroyer.standardErrors.value[0].message)
      .toContain('abort')
    expect(repo.find('1'))
      .not.toBeNull()
    expect(repo.all().length)
      .toEqual(2)
  })

  it('can notify on error', async () => {
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])
    vueModelState.config.errorNotifiers = {
      destroy: () => {
        return ''
      },
    }

    const destroyErrorNotifierSpy = vi.spyOn(vueModelState.config.errorNotifiers, 'destroy')

    const postDestroyer = useDestroyer(User, { notifyOnError: true })
    await postDestroyer.destroy('1')

    expect(destroyErrorNotifierSpy).toHaveBeenCalled()
  })
})
