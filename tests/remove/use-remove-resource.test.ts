import { describe, beforeEach, it, expect, vi } from 'vitest'
import { baseSetup } from '../baseSetup'
import { useIndexResources, useRemoveResource, UseRemoveResourceOptions } from '@vuemodel/core'
import { Post, populateRecords } from '@vuemodel/sample-data'
import { useRepo } from 'pinia-orm'
import { ref } from 'vue'
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage'

describe('useRemoveResource', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('removes the record from the store after calling remove("some-id")', async () => {
    await populateRecords('posts', 2)
    const postsIndexer = useIndexResources(Post)
    await postsIndexer.index()
    const postRepo = useRepo(Post)

    const postRemover = useRemoveResource(Post)
    await postRemover.remove('2')

    expect(postRepo.all().length).toEqual(1)
  })

  it('does not remove the record from the store after remove() when "persist" is false', async () => {
    const postRepo = useRepo(Post)
    await populateRecords('posts', 2)
    const postsIndexer = useIndexResources(Post)
    await postsIndexer.index()

    const postRemover = useRemoveResource(Post, { persist: false })
    await postRemover.remove('2')

    expect(postRepo.all().length).toEqual(2)
  })

  it('can remove a resource using "options.id"', async () => {
    await populateRecords('posts', 2)
    const postsIndexer = useIndexResources(Post)
    await postsIndexer.index()
    const postRepo = useRepo(Post)

    const id = ref('2')
    const postRemover = useRemoveResource(Post, { id })
    await postRemover.remove()

    expect(postRepo.all().length).toEqual(1)
  })

  it('uses the correct precedence when removing by id', async () => {
    // remover.remove(id) -> options.id
    await populateRecords('posts', 2)
    const postsIndexer = useIndexResources(Post)
    await postsIndexer.index()
    const postRepo = useRepo(Post)

    const id = ref('2')
    const postRemover = useRemoveResource(Post, { id })
    await postRemover.remove('1')

    expect(postRepo.all().length).toEqual(1)
    expect(postRepo.query().first()).toHaveProperty('title', 'qui est esse')
  })

  it('has a "removing" value of the records id while removing', async () => {
    await populateRecords('posts', 2)
    piniaLocalStorageState.mockLatencyMs = 150

    const postRemover = useRemoveResource(Post)
    const removePromise = postRemover.remove('2')

    expect(postRemover.removing.value).toEqual('2')
    await removePromise
    expect(postRemover.removing.value).toEqual(undefined)
  })

  it('can access the record after removing it', async () => {
    await populateRecords('posts', 2)
    const postRemover = useRemoveResource(Post)
    await postRemover.remove('2')

    expect(postRemover.record.value).toHaveProperty('title', 'qui est esse')
  })

  it('hits the "onSuccess" callback on success', async () => {
    await populateRecords('posts', 2)
    const options: UseRemoveResourceOptions<typeof Post> = {
      onSuccess () {
        return true
      },
    }
    const onSuccessSpy = vi.spyOn(options, 'onSuccess')

    const postRemover = useRemoveResource(Post, options)
    await postRemover.remove('2')

    expect(onSuccessSpy).toHaveBeenCalled()
  })

  it('can optimistically remove', async () => {
    await populateRecords('posts', 2)
    const postsIndexer = useIndexResources(Post)
    await postsIndexer.index()
    const postRepo = useRepo(Post)
    const postRemover = useRemoveResource(Post, { optimistic: true })
    piniaLocalStorageState.mockLatencyMs = 200

    postRemover.remove('1') // intentionally not awaited

    expect(postRepo.all().length).toEqual(1)
  })

  it('rolls back if the remove fails when using optimistic', async () => {
    await populateRecords('posts', 2)
    const postsIndexer = useIndexResources(Post)
    await postsIndexer.index()
    const postRepo = useRepo(Post)

    const postRemover = useRemoveResource(Post, { optimistic: true })

    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went wrong', name: 'oops' }]
    piniaLocalStorageState.mockLatencyMs = 200
    const removePromise = postRemover.remove('1') // intentionally not awaited

    expect(postRepo.all().length).toEqual(1)
    await removePromise
    expect(postRepo.all().length).toEqual(2)
    expect(postRepo.find('1')).toHaveProperty('created_at', '2023-01-13T07:55:59.107Z')
  })

  it('sets standard errors when the response has standard errors', async () => {
    const postRemover = useRemoveResource(Post)
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]

    await postRemover.remove('1')

    expect(postRemover.standardErrors.value[0])
      .toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })
  })

  it('clears standard errors when a request is made', async () => {
    await populateRecords('posts', 2)
    const postsIndexer = useIndexResources(Post)
    await postsIndexer.index()

    const postRemover = useRemoveResource(Post)
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]

    await postRemover.remove('1')

    expect(postRemover.standardErrors.value[0])
      .toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })

    piniaLocalStorageState.mockStandardErrors = undefined
    await postRemover.remove('2')

    expect(postRemover.standardErrors.value.length)
      .toEqual(0)
  })

  it('success and error responses have an "action" of "remove"', async () => {
    const postRemove = useRemoveResource(Post)
    piniaLocalStorageState.mockStandardErrors = [{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }]

    await postRemove.remove('1')

    expect(postRemove.response.value.action)
      .toEqual('remove')

    piniaLocalStorageState.mockStandardErrors = []
    await postRemove.remove('2')

    expect(postRemove.response.value.action)
      .toEqual('remove')
  })
})
