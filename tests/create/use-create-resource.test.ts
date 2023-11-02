import { describe, beforeEach, it, expect } from 'vitest'
import { Form, useCreateResource } from '@vuemodel/core'
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage'
import { Post } from 'sample-data'
import { ref } from 'vue'
import { useRepo } from 'pinia-orm'
import { wait } from '../helpers/wait'
import { baseSetup } from '../baseSetup'

describe('useCreateResource', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('can pass a form to the composables options and create', async () => {
    const form = ref<Form<Post>>({
      title: 'LSD Standard',
    })

    const postCreator = useCreateResource(Post, { form })
    await postCreator.create()

    expect(postCreator.record.value.title).toEqual('LSD Standard')
  })

  it('can use the "form" from the composables return and create', async () => {
    const postCreator = useCreateResource(Post)

    postCreator.form.value.title = 'LSD Standard'
    await postCreator.create()

    expect(postCreator.record.value.title).toEqual('LSD Standard')
  })

  it('can pass the form directly to "create"', async () => {
    const postCreator = useCreateResource(Post)

    await postCreator.create({ title: 'LSD Standard' })

    expect(postCreator.record.value.title).toEqual('LSD Standard')
  })

  it('can merge fields into the form when it is being created', async () => {
    const postCreator = useCreateResource(Post, {
      merge: () => ({ title: 'LSD Standard' }),
    })

    await postCreator.create()

    expect(postCreator.record.value.title).toEqual('LSD Standard')
  })

  it('has the correct precedence when merging', async () => {
    const optionsForm = ref<Form<Post>>({
      body: 'Good Stuff!!!',
      id: '4',
    })
    const postCreator = useCreateResource(Post, {
      form: optionsForm,
      merge: () => ({
        title: 'LSD Standard',
        body: 'Brilliant Stuff!',
        id: '5',
      }),
    })

    await postCreator.create({ id: '3' })

    expect(postCreator.record.value.title).toEqual('LSD Standard')
    expect(postCreator.record.value.body).toEqual('Good Stuff!!!')
    expect(postCreator.record.value.id).toEqual('3')
  })

  it('resets the form after a successful create', async () => {
    const postCreator = useCreateResource(Post)
    postCreator.form.value.title = 'LSD Standard'

    await postCreator.create()

    expect(postCreator.form.value.title).toEqual(undefined)
  })

  it('persists the record to the store after create()', async () => {
    const postCreator = useCreateResource(Post)
    const postRepo = useRepo(Post)
    postCreator.form.value.title = 'LSD Standard'

    await postCreator.create()

    const post = postRepo.find(postCreator.response.value.record.id)
    expect(postCreator.record.value).toHaveProperty('title', 'LSD Standard')
    expect(postCreator.record.value).instanceOf(Post)

    expect(post).toHaveProperty('title', 'LSD Standard')
    expect(post).instanceOf(Post)
  })

  it('does not persist the record to the store after create() when "persist" is false', async () => {
    const postRepo = useRepo(Post)
    const postCreator = useCreateResource(Post, { persist: false })
    postCreator.form.value.title = 'LSD Standard'

    await postCreator.create()

    const post = postRepo.find(postCreator.response.value.record.id)
    expect(post).toBeNull()
  })

  it('has a "creating" value of true while creating', async () => {
    const postCreator = useCreateResource(Post)
    piniaLocalStorageState.mockLatencyMs = 250
    postCreator.form.value.title = 'LSD Standard'

    postCreator.create() // intentionally not awaited
    expect(postCreator.creating.value).toBe(true)
    await wait(251)
    expect(postCreator.creating.value).toBe(false)
  })

  it('can access the "record" after creating', async () => {
    const postCreator = useCreateResource(Post)
    postCreator.form.value.title = 'LSD Standard'

    await postCreator.create()

    expect(postCreator.record.value).toHaveProperty('title', 'LSD Standard')
  })

  it('sets validation errors when the response has validation errors', async () => {
    const postCreator = useCreateResource(Post)
    piniaLocalStorageState.mockValidationErrors = {
      title: ['title is required'],
    }

    await postCreator.create()

    expect(postCreator.validationErrors.value.title)
      .toEqual(expect.arrayContaining(['title is required']))
  })

  it('clears validation errors when a request is made', async () => {
    const postCreator = useCreateResource(Post)
    piniaLocalStorageState.mockValidationErrors = {
      title: ['title is required'],
    }

    await postCreator.create()

    expect(postCreator.validationErrors.value.title)
      .toEqual(expect.arrayContaining(['title is required']))

    piniaLocalStorageState.mockValidationErrors = undefined
    await postCreator.create()

    expect(Object.values(postCreator.validationErrors.value).length)
      .toEqual(0)
  })

  it('sets standard errors when the response has standard errors', async () => {
    const postCreator = useCreateResource(Post)
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]

    await postCreator.create()

    expect(postCreator.standardErrors.value[0])
      .toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })
  })

  it('clears standard errors when a request is made', async () => {
    const postCreator = useCreateResource(Post)
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]

    await postCreator.create()

    expect(postCreator.standardErrors.value[0])
      .toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })

    piniaLocalStorageState.mockStandardErrors = undefined
    await postCreator.create()

    expect(postCreator.standardErrors.value.length)
      .toEqual(0)
  })

  it('does not reset the form if create fails', async () => {
    const postCreator = useCreateResource(Post)
    postCreator.form.value.title = 'solid title!'
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]

    await postCreator.create()

    expect(postCreator.form.value.title)
      .toEqual('solid title!')
  })

  it('can optimistically create', async () => {
    const postCreator = useCreateResource(Post, { optimistic: true })
    piniaLocalStorageState.mockLatencyMs = 250

    postCreator.create({ title: 'solid title!' }) // intentionally not awaited

    expect(postCreator.record.value?.title)
      .toEqual('solid title!')
  })

  it('rolls back if the create fails when using optimistic', async () => {
    const postsRepo = useRepo(Post)
    const postCreator = useCreateResource(Post, { optimistic: true })
    piniaLocalStorageState.mockLatencyMs = 250
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]

    const createPromise = postCreator.create({ title: 'solid title!' }) // intentionally not awaited

    // Assumes success
    expect(postsRepo.all().length).toEqual(1)
    expect(postCreator.record.value?.title)
      .toEqual('solid title!')

    await createPromise

    // Then hits error, and rollback occurs
    expect(postCreator.record.value).not.toEqual('solid title!')
    expect(postsRepo.all().length).toEqual(0)
  })

  it('can rollback correctly when creating two records at the same time', async () => {
    const postsRepo = useRepo(Post)
    const postCreator = useCreateResource(Post, { optimistic: true })
    piniaLocalStorageState.mockLatencyMs = 300
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]

    const createPromise1 = postCreator.create({ title: 'promise 1' }) // intentionally not awaited
    await wait(150)
    const createPromise2 = postCreator.create({ title: 'promise 2' }) // intentionally not awaited

    // Assumes success for both
    expect(postsRepo.all().length).toEqual(2)

    // first create errors, rollback should have occurred
    await createPromise1
    expect(postsRepo.all().length).toEqual(1)

    // second create errors, rollback should have occurred
    await createPromise2
    expect(postsRepo.all().length).toEqual(0)
  })

  it('deletes an active request on success', async () => {
    const postCreator = useCreateResource(Post)
    piniaLocalStorageState.mockLatencyMs = 300

    const createPromise1 = postCreator.create({ title: 'promise 1' }) // intentionally not awaited
    await wait(150)
    const createPromise2 = postCreator.create({ title: 'promise 2' }) // intentionally not awaited

    expect(Object.entries(postCreator.activeRequests.value).length).toEqual(2)

    await createPromise1
    expect(Object.entries(postCreator.activeRequests.value).length).toEqual(1)

    await createPromise2
    expect(Object.entries(postCreator.activeRequests.value).length).toEqual(0)
  })

  it('deletes an active request on error', async () => {
    const postCreator = useCreateResource(Post)
    piniaLocalStorageState.mockLatencyMs = 300
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]

    const createPromise1 = postCreator.create({ title: 'promise 1' }) // intentionally not awaited
    await wait(150)
    const createPromise2 = postCreator.create({ title: 'promise 2' }) // intentionally not awaited

    // Assumes success for both
    expect(Object.entries(postCreator.activeRequests.value).length).toEqual(2)

    await createPromise1
    expect(Object.entries(postCreator.activeRequests.value).length).toEqual(1)

    await createPromise2
    expect(Object.entries(postCreator.activeRequests.value).length).toEqual(0)
  })

  it('success and error responses have an "action" of "create"', async () => {
    const postCreator = useCreateResource(Post)
    piniaLocalStorageState.mockStandardErrors = [{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }]

    await postCreator.create({})

    expect(postCreator.response.value.action)
      .toEqual('create')

    piniaLocalStorageState.mockStandardErrors = []
    await postCreator.create({})

    expect(postCreator.response.value.action)
      .toEqual('create')
  })
})
