import { describe, beforeEach, it, expect, vi } from 'vitest'
import { update, vueModelState } from '@vuemodel/core'
import { Post, User } from '@vuemodel/sample-data'
import 'fake-indexeddb/auto'
import { baseSetup } from '../baseSetup'
import { implementationSetupsMap } from '../implementations/implementationSetupsMap'

const setups = implementationSetupsMap[import.meta.env.IMPLEMENTATION ?? 'piniaLocalStorage']

describe('update', () => {
  beforeEach(async (ctx) => {
    await baseSetup(ctx)
  })

  it('can update a resource', async () => {
    await setups.populateRecords('posts', 5)

    const result = await update(Post, '3', { title: 'lugu' })

    expect(result.record).toHaveProperty(
      'title',
      'lugu',
    )
  })

  it('can respond with validation errors', async () => {
    setups.setMockValidationErrors({
      email: ['please enter a valid email'],
    })

    const result = await update(User, '1', { email: 'invalidemail' })

    expect(result.validationErrors.email[0]).contains('email')
  })

  it('can respond with standard errors', async () => {
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])

    const result = await update(User, '1', {})

    expect(result.standardErrors[0].message).toBeTypeOf('string')
  })

  it('can notify on error', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.drivers.testDriver.config = {
      errorNotifiers: {
        update: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.testDriver.config.errorNotifiers, 'update')

    await update(Post, '1', {}, { notifyOnError: true })

    expect(notifyOnErrorSpy).toHaveBeenCalledOnce()
  })

  it('does not notify on error by default', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.drivers.testDriver.config = {
      errorNotifiers: {
        update: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.testDriver.config.errorNotifiers, 'update')

    await update(Post, '1', {})

    expect(notifyOnErrorSpy).not.toHaveBeenCalled()
  })

  it('has a first preference for notifyOnError passed as a param', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { update: false }
    vueModelState.drivers.testDriver.config = {
      errorNotifiers: {
        update: () => { return {} },
      },
      notifyOnError: { update: false },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.testDriver.config.errorNotifiers, 'update')

    await update(Post, '1', {}, { notifyOnError: true }) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a second preference for notifyOnError set at a "state.driver.config" level', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { update: false }
    vueModelState.drivers.testDriver.config = {
      errorNotifiers: {
        update: () => { return {} },
      },
      notifyOnError: { update: true },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.testDriver.config.errorNotifiers, 'update')

    await update(Post, '1', {}) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a third preference for notifyOnError set at a "state.config" level', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { update: true }
    vueModelState.drivers.testDriver.config = {
      errorNotifiers: {
        update: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.testDriver.config.errorNotifiers, 'update')

    await update(Post, '1', {}) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('does not throw if "options.throw" is false', async () => {
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])
    expect(async () => await update(Post, 'id', { title: 'beep' })).not.toThrow()
  })

  it('has first precedence for options.throw', async () => {
    vueModelState.drivers.testDriver.config.throw = false
    vueModelState.config.throw = false
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])

    expect(async () => await update(Post, 'id', { title: 'beep' }, { throw: true })).rejects.toThrow()
  })

  it('has second precedence for options.driver.throw', async () => {
    vueModelState.drivers.testDriver.config.throw = true
    vueModelState.config.throw = false
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])

    expect(async () => await update(Post, '1', { title: 'beep' })).rejects.toThrow()
  })

  it('has third precedence for options.throw', async () => {
    vueModelState.config.throw = true
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])

    expect(async () => await update(Post, '1', { title: 'beep' })).rejects.toThrow()
  })
})
