import { describe, beforeEach, it, expect, vi } from 'vitest'
import { Form, UseCreatorOptions, useCreator, vueModelState } from '@vuemodel/core'
import { DataverseUser, PhotoTag, Post, User } from '@vuemodel/sample-data'
import { ref } from 'vue'
import { useRepo } from 'pinia-orm'
import { wait } from '../helpers/wait'
import { baseSetup } from '../baseSetup'
import { driverSetupsMap } from '../drivers/driverSetupsMap'

const setups = driverSetupsMap[import.meta.env.IMPLEMENTATION ?? 'piniaLocalStorage']

describe('useCreator', () => {
  beforeEach(async (ctx) => {
    await baseSetup(ctx)
  })

  it('can pass a form to the composables options and create', async () => {
    const form = ref<Form<Post>>({
      title: 'LSD Standard',
    })

    const postCreator = useCreator(Post, { form })
    await postCreator.create()

    expect(postCreator.record.value.title).toEqual('LSD Standard')
  })

  it('can use the "form" from the composables return and create', async () => {
    const postCreator = useCreator(Post)

    postCreator.form.value.title = 'LSD Standard'
    await postCreator.create()

    expect(postCreator.record.value.title).toEqual('LSD Standard')
  })

  it('can pass the form directly to "create"', async () => {
    const postCreator = useCreator(Post)

    await postCreator.create({ title: 'LSD Standard' })

    expect(postCreator.record.value.title).toEqual('LSD Standard')
  })

  it('can merge fields into the form when it is being created', async () => {
    const postCreator = useCreator(Post, {
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
    const postCreator = useCreator(Post, {
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
    const postCreator = useCreator(Post)
    postCreator.form.value.title = 'LSD Standard'

    await postCreator.create()

    expect(postCreator.form.value.title).toEqual(undefined)
  })

  it('persists the record to the store after create()', async () => {
    const postCreator = useCreator(Post)
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
    const postCreator = useCreator(Post, { persist: false })
    postCreator.form.value.title = 'LSD Standard'

    await postCreator.create()

    const post = postRepo.find(postCreator.response.value.record.id)
    expect(post).toBeNull()
  })

  it('has a "creating" value of true while creating', async () => {
    setups.setMockLatency(50)
    const postCreator = useCreator(Post)
    postCreator.form.value.title = 'LSD Standard'

    postCreator.create() // intentionally not awaited
    expect(postCreator.creating.value).toBe(true)
    await wait(80)
    expect(postCreator.creating.value).toBe(false)
  })

  it('can access the "record" after creating', async () => {
    const postCreator = useCreator(Post)
    postCreator.form.value.title = 'LSD Standard'

    await postCreator.create()

    expect(postCreator.record.value).toHaveProperty('title', 'LSD Standard')
  })

  it('sets validation errors when the response has validation errors', async () => {
    const postCreator = useCreator(Post)
    setups.setMockValidationErrors({
      title: ['title is required'],
    })

    await postCreator.create()

    expect(postCreator.validationErrors.value.title[0])
      .toBeTypeOf('string')
  })

  it('clears validation errors when a request is made', async () => {
    const postCreator = useCreator(Post)
    setups.setMockValidationErrors({
      title: ['title is required'],
    })

    await postCreator.create()

    expect(postCreator.validationErrors.value.title[0])
      .toBeTypeOf('string')

    setups.setMockValidationErrors(undefined)
    await postCreator.create({ title: 'Exists' })

    expect(Object.values(postCreator.validationErrors.value).length)
      .toEqual(0)
  })

  it('sets standard errors when the response has standard errors', async () => {
    const postCreator = useCreator(Post)
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])

    await postCreator.create()

    expect(postCreator.standardErrors.value[0].message)
      .toBeTypeOf('string')
  })

  it('clears standard errors when a request is made', async () => {
    const postCreator = useCreator(Post)
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])

    await postCreator.create()

    expect(postCreator.standardErrors.value[0].message)
      .toBeTypeOf('string')

    setups.setMockStandardErrors(undefined)
    await postCreator.create({ title: 'some title' })

    expect(postCreator.standardErrors.value.length)
      .toEqual(0)
  })

  it('does not reset the form if create fails', async () => {
    const postCreator = useCreator(Post)
    postCreator.form.value.body = 'solid body!'
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])

    await postCreator.create()

    expect(postCreator.form.value.body)
      .toEqual('solid body!')
  })

  it('can optimistically create', async () => {
    const postCreator = useCreator(Post, { optimistic: true })
    setups.setMockLatency(50)

    postCreator.create({ title: 'solid title!' }) // intentionally not awaited

    expect(postCreator.record.value?.title)
      .toEqual('solid title!')
  })

  it('can set optimistic globally', async () => {
    // const postCreator = useCreator(Post, { optimistic: true })
    // setups.setMockLatency(50)

    // postCreator.create({ title: 'solid title!' }) // intentionally not awaited

    // expect(postCreator.record.value?.title)
    //   .toEqual('solid title!')
  })

  it('rolls back if the create fails when using optimistic', async () => {
    const postsRepo = useRepo(Post)
    const postCreator = useCreator(Post, { optimistic: true })
    setups.setMockLatency(50)
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])

    const createPromise = postCreator.create({ body: 'solid title!' }) // intentionally not awaited

    // Assumes success
    expect(postsRepo.all().length).toEqual(1)
    expect(postCreator.record.value?.body)
      .toEqual('solid title!')

    await createPromise

    // Then hits error, and rollback occurs
    expect(postCreator.record.value).not.toEqual('solid title!')
    expect(postsRepo.all().length).toEqual(0)
  })

  it('can rollback correctly when creating two records at the same time', async () => {
    const postsRepo = useRepo(Post)
    const postCreator = useCreator(Post, { optimistic: true })
    setups.setMockLatency(150)
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])

    const createPromise1 = postCreator.create({ body: 'promise 1' }) // intentionally not awaited
    const createPromise2 = postCreator.create({ body: 'promise 2' }) // intentionally not awaited

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
    const postCreator = useCreator(Post)
    setups.setMockLatency(150)

    const createPromise1 = postCreator.create({ title: 'promise 1' }) // intentionally not awaited
    const createPromise2 = postCreator.create({ title: 'promise 2' }) // intentionally not awaited

    expect(Object.entries(postCreator.activeRequests.value).length).toEqual(2)

    await createPromise1
    expect(Object.entries(postCreator.activeRequests.value).length).toEqual(1)

    await createPromise2
    expect(Object.entries(postCreator.activeRequests.value).length).toEqual(0)
  })

  it('deletes an active request on error', async () => {
    const postCreator = useCreator(Post)
    setups.setMockLatency(150)
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])

    const createPromise1 = postCreator.create({ title: 'promise 1' }) // intentionally not awaited
    const createPromise2 = postCreator.create({ title: 'promise 2' }) // intentionally not awaited

    // Assumes success for both
    expect(Object.entries(postCreator.activeRequests.value).length).toEqual(2)

    await createPromise1
    expect(Object.entries(postCreator.activeRequests.value).length).toEqual(1)

    await createPromise2
    expect(Object.entries(postCreator.activeRequests.value).length).toEqual(0)
  })

  it('success and error responses have an "action" of "create"', async () => {
    const postCreator = useCreator(Post)
    setups.setMockStandardErrors([{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }])

    await postCreator.create({})

    expect(postCreator.response.value.action)
      .toEqual('create')

    setups.setMockStandardErrors([])
    await postCreator.create({})

    expect(postCreator.response.value.action)
      .toEqual('create')
  })

  it('hits the "onSuccess" callback on success', async () => {
    const options: UseCreatorOptions<typeof Post> = {
      onSuccess () {
        return true
      },
    }
    const onSuccessSpy = vi.spyOn(options, 'onSuccess')

    const postCreator = useCreator(Post, options)
    await postCreator.create({ title: 'beep' })

    expect(onSuccessSpy).toHaveBeenCalled()
  })

  it('hits the "onError" callback when there is a standard error', async () => {
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])
    const options: UseCreatorOptions<typeof Post> = {
      onError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onError')

    const postCreator = useCreator(Post, options)
    await postCreator.create({ body: 'beep' })

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('hits the "onError" callback when there is a validation error', async () => {
    setups.setMockValidationErrors({
      title: ['title is required'],
    })
    const options: UseCreatorOptions<typeof Post> = {
      onError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onError')

    const postCreator = useCreator(Post, options)
    await postCreator.create({ body: 'beep' })

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('hits the "onStandardError" callback when there are one or more standard errors', async () => {
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])
    const options: UseCreatorOptions<typeof Post> = {
      onStandardError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onStandardError')

    const postCreator = useCreator(Post, options)
    await postCreator.create({ body: 'beep' })

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('hits the "onValidationError" callback when there are one or more validation errors', async () => {
    setups.setMockValidationErrors({
      title: ['title is required'],
    })
    const options: UseCreatorOptions<typeof Post> = {
      onValidationError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onValidationError')

    const postCreator = useCreator(Post, options)
    await postCreator.create({ body: 'beep' })

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('can create a resource with a composite key', async () => {
    const photoTagCreator = useCreator(PhotoTag)

    await photoTagCreator.create({
      photo_id: '8',
      tag_id: '11',
    })

    expect(photoTagCreator.record.value)
      .toBeTruthy()

    expect(photoTagCreator.record.value)
      .toMatchObject({
        photo_id: '8',
        tag_id: '11',
      })
  })

  it('can create a record that has a different primaryKey to "id"', async () => {
    const dataverseUserCreator = useCreator(DataverseUser)

    await dataverseUserCreator.create({
      name: 'lugu',
    })

    expect(dataverseUserCreator.record.value.name)
      .toEqual('lugu')

    expect(dataverseUserCreator.record.value.userid)
      .toBeTruthy()
  })

  it('can create two records at the same time', async () => {
    const postRepo = useRepo(Post)
    const postCreator = useCreator(Post)

    const createRequestA = postCreator.create({ title: 'Good Ol Post' })
    await wait(50)
    const createRequestB = postCreator.create({ title: 'Lugus Post' })

    await Promise.all([createRequestA, createRequestB])

    expect(postRepo.all().length).toEqual(2)
    expect(postRepo.all().map(record => record.title))
      .toEqual(['Good Ol Post', 'Lugus Post'])
    expect(postCreator.record.value.title).toEqual('Lugus Post')
  })

  it('can cancel the request', async () => {
    const repo = useRepo(User)
    setups.setMockLatency(100)

    const usersCreator = useCreator(User)
    const createRequest = usersCreator.create({ name: 'lugu' })
    usersCreator.cancel()
    await createRequest

    expect(usersCreator.standardErrors.value[0].message)
      .toContain('abort')
    expect(repo.find('1')).toBeFalsy()
  })

  it('can notify on error', async () => {
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])
    vueModelState.config.errorNotifiers = {
      create: () => {
        return ''
      },
    }

    const createErrorNotifierSpy = vi.spyOn(vueModelState.config.errorNotifiers, 'create')

    const postCreator = useCreator(User, { notifyOnError: true })
    await postCreator.create({ name: 'Ann' })

    expect(createErrorNotifierSpy).toHaveBeenCalled()
  })
})
