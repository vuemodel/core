import { describe, beforeEach, it, expect, vi } from 'vitest'
import { createResource, findResource, vueModelState } from '@vuemodel/core'
import { Post, User } from 'sample-data'
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage/src/plugin/state'
import { baseSetup } from '../baseSetup'

describe('createResource', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('can create a single resource', async () => {
    const result = await createResource(Post, {
      title: 'My post',
      body: 'Lorem ipsum...',
      created_at: String(new Date()),
      id: '1',
      user_id: '1',
    })

    expect(result.record).toHaveProperty('title', 'My post')
    const foundResult = await findResource(Post, '1')
    expect(foundResult.record).toHaveProperty('body', 'Lorem ipsum...')
  })

  it('can respond with validation errors', async () => {
    piniaLocalStorageState.mockValidationErrors = {
      email: ['email is required'],
    }

    const result = await createResource(User, {})

    expect(result.validationErrors.email).toEqual(expect.arrayContaining(['email is required']))
  })

  it('can respond with standard errors', async () => {
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]

    const result = await createResource(User, {})

    expect(result.standardErrors[0]).toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })
  })

  it('can notify on error', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        create: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'create')

    await createResource(Post, {}, { notifyOnError: true })

    expect(notifyOnErrorSpy).toHaveBeenCalledOnce()
  })

  it('does not notify on error by default', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        create: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'create')

    await createResource(Post, {})

    expect(notifyOnErrorSpy).not.toHaveBeenCalled()
  })

  it('has a first preference for notifyOnError passed as a param', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.config.notifyOnError = { create: false }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        create: () => { return {} },
      },
      notifyOnError: { create: false },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'create')

    await createResource(Post, {}, { notifyOnError: true }) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a second preference for notifyOnError set at a "state.driver.config" level', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.config.notifyOnError = { create: false }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        create: () => { return {} },
      },
      notifyOnError: { create: true },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'create')

    await createResource(Post, {}) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a third preference for notifyOnError set at a "state.config" level', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.config.notifyOnError = { create: true }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        create: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'create')

    await createResource(Post, {}) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })
})
