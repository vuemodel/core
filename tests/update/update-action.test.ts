import { describe, beforeEach, it, expect, vi } from 'vitest'
import { update, vueModelState } from '@vuemodel/core'
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage'
import { Post, User, populateRecords } from '@vuemodel/sample-data'
import 'fake-indexeddb/auto'
import { baseSetup } from '../baseSetup'

describe('update', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('can update a resource', async () => {
    await populateRecords('posts', 5)

    const result = await update(Post, '3', { title: 'lugu' })

    expect(result.record).toHaveProperty(
      'title',
      'lugu',
    )
  })

  it('can respond with validation errors', async () => {
    piniaLocalStorageState.mockValidationErrors = {
      email: ['email is required'],
    }

    const result = await update(User, '1', {})

    expect(result.validationErrors.email).toEqual(expect.arrayContaining(['email is required']))
  })

  it('can respond with standard errors', async () => {
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]

    const result = await update(User, '1', {})

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

    await update(Post, '1', {}, { notifyOnError: true })

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

    await update(Post, '1', {})

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

    await update(Post, '1', {}, { notifyOnError: true }) // as param takes precedence

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

    await update(Post, '1', {}) // as param takes precedence

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

    await update(Post, '1', {}) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('does not throw if "options.throw" is false', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ name: 'oops', message: 'something went baaad!' }]
    expect(async () => await update(Post, 'id', { title: 'beep' })).not.toThrow()
  })

  it('has first precedence for options.throw', async () => {
    vueModelState.drivers.local.config.throw = false
    vueModelState.config.throw = false
    piniaLocalStorageState.mockStandardErrors = [{ name: 'oops', message: 'something went baaad!' }]

    expect(async () => await update(Post, 'id', { title: 'beep' }, { throw: true })).rejects.toThrow()
  })

  it('has second precedence for options.driver.throw', async () => {
    vueModelState.drivers.local.config.throw = true
    vueModelState.config.throw = false
    piniaLocalStorageState.mockStandardErrors = [{ name: 'oops', message: 'something went baaad!' }]

    expect(async () => await update(Post, '1', { title: 'beep' })).rejects.toThrow()
  })

  it('has third precedence for options.throw', async () => {
    vueModelState.config.throw = true
    piniaLocalStorageState.mockStandardErrors = [{ name: 'oops', message: 'something went baaad!' }]

    expect(async () => await update(Post, '1', { title: 'beep' })).rejects.toThrow()
  })
})
