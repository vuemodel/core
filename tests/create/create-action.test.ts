import { describe, beforeEach, it, expect, vi } from 'vitest'
import { create, find, vueModelState } from '@vuemodel/core'
import { Post, User } from '@vuemodel/sample-data'
import { baseSetup } from '../baseSetup'
import 'fake-indexeddb/auto'
import { driverSetupsMap } from '../drivers/driverSetupsMap'

const setups = driverSetupsMap[import.meta.env.IMPLEMENTATION ?? 'piniaLocalStorage']

describe('create', () => {
  beforeEach(async (ctx) => {
    await baseSetup(ctx)
  })

  it('can create a single resource', async () => {
    const result = await create(Post, {
      title: 'My post',
      body: 'Lorem ipsum...',
      created_at: (new Date()).toJSON(),
      id: '1',
      user_id: '1',
    })

    expect(result.record).toHaveProperty('title', 'My post')
    const foundResult = await find(Post, '1')
    expect(foundResult.record).toHaveProperty('body', 'Lorem ipsum...')
  })

  it('can respond with validation errors', async () => {
    setups.setMockValidationErrors({
      email: ['email is required'],
    })

    const result = await create(User, {})

    expect(result.validationErrors.email[0]).toContain('email')
  })

  it('can respond with standard errors', async () => {
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])

    const result = await create(User, {})

    expect(result.standardErrors[0]).toHaveProperty('name')
    expect(result.standardErrors[0]).toHaveProperty('message')
  })

  it('can notify on error', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.drivers.testDriver.config = {
      errorNotifiers: {
        create: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.testDriver.config.errorNotifiers, 'create')

    await create(Post, {}, { notifyOnError: true })

    expect(notifyOnErrorSpy).toHaveBeenCalledOnce()
  })

  it('does not notify on error by default', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.drivers.testDriver.config = {
      errorNotifiers: {
        create: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.testDriver.config.errorNotifiers, 'create')

    await create(Post, {})

    expect(notifyOnErrorSpy).not.toHaveBeenCalled()
  })

  it('has a first preference for notifyOnError passed as a param', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { create: false }
    vueModelState.drivers.testDriver.config = {
      errorNotifiers: {
        create: () => { return {} },
      },
      notifyOnError: { create: false },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.testDriver.config.errorNotifiers, 'create')

    await create(Post, {}, { notifyOnError: true }) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a second preference for notifyOnError set at a "state.driver.config" level', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { create: false }
    vueModelState.drivers.testDriver.config = {
      errorNotifiers: {
        create: () => { return {} },
      },
      notifyOnError: { create: true },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.testDriver.config.errorNotifiers, 'create')

    await create(Post, {}) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a third preference for notifyOnError set at a "state.config" level', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { create: true }
    vueModelState.drivers.testDriver.config = {
      errorNotifiers: {
        create: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.testDriver.config.errorNotifiers, 'create')

    await create(Post, {}) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('does not throw if "options.throw" is false', async () => {
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])
    expect(async () => await create(Post, { title: 'beep' })).not.toThrow()
  })

  it('has first precedence for options.throw', async () => {
    vueModelState.drivers.testDriver.config.throw = false
    vueModelState.config.throw = false
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])

    expect(
      async () => await create(User, { email: 'beep' }, { throw: true }),
    ).rejects.toThrow()
  })

  it('has second precedence for options.driver.throw', async () => {
    vueModelState.drivers.testDriver.config.throw = true
    vueModelState.config.throw = false
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])

    expect(async () => await create(User, { email: 'beep' })).rejects.toThrow()
  })

  it('has third precedence for options.throw', async () => {
    vueModelState.config.throw = true
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])

    expect(async () => await create(User, { email: 'beep' })).rejects.toThrow()
  })
})
