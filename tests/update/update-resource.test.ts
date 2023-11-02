import { describe, beforeEach, it, expect, vi } from 'vitest'
import { createVueModel, updateResource, vueModelState } from '@vuemodel/core'
import { createPiniaLocalStorage, piniaLocalVueModelDriver } from '@vuemodel/pinia-local-storage'
import { Post, User } from 'sample-data'
import { clear as clearStorage } from 'localforage'
import { populateRecords } from '../helpers/populateRecords'
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage/src/plugin/state'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

describe('updateResource', () => {
  beforeEach(() => {
    clearStorage()
    const app = createApp({})

    const piniaLocalStorage = createPiniaLocalStorage()
    const vueModel = createVueModel({
      default: 'local',
      drivers: { local: piniaLocalVueModelDriver },
    })

    app.use(createPinia())
    app.use(vueModel)
    app.use(piniaLocalStorage)
  })

  it('can update a resource', async () => {
    await populateRecords('posts', 5)

    const result = await updateResource(Post, '3', { title: 'lugu' })

    expect(result.record).toHaveProperty(
      'title',
      'lugu',
    )
  })

  it('can respond with validation errors', async () => {
    piniaLocalStorageState.mockValidationErrors = {
      email: ['email is required'],
    }

    const result = await updateResource(User, '1', {})

    expect(result.validationErrors.email).toEqual(expect.arrayContaining(['email is required']))
  })

  it('can respond with standard errors', async () => {
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]

    const result = await updateResource(User, '1', {})

    expect(result.standardErrors[0]).toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })
  })

  it('can notify on error', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        update: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'update')

    await updateResource(Post, '1', {}, { notifyOnError: true })

    expect(notifyOnErrorSpy).toHaveBeenCalledOnce()
  })

  it('does not notify on error by default', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        update: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'update')

    await updateResource(Post, '1', {})

    expect(notifyOnErrorSpy).not.toHaveBeenCalled()
  })

  it('has a first preference for notifyOnError passed as a param', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.config.notifyOnError = { update: false }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        update: () => { return {} },
      },
      notifyOnError: { update: false },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'update')

    await updateResource(Post, '1', {}, { notifyOnError: true }) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a second preference for notifyOnError set at a "state.driver.config" level', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.config.notifyOnError = { update: false }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        update: () => { return {} },
      },
      notifyOnError: { update: true },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'update')

    await updateResource(Post, '1', {}) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a third preference for notifyOnError set at a "state.config" level', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.config.notifyOnError = { update: true }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        update: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'update')

    await updateResource(Post, '1', {}) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })
})
