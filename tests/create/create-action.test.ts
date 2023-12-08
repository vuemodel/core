import { describe, beforeEach, it, expect, vi } from 'vitest'
import { create, find, vueModelState } from '@vuemodel/core'
import { Post, User } from '@vuemodel/sample-data'
import { baseSetup } from '../baseSetup'
import 'fake-indexeddb/auto'
import { implementationSetupsMap } from '../implementations/implementationSetupsMap'

const setups = implementationSetupsMap[import.meta.env.IMPLEMENTATION ?? 'piniaLocalStorage']

describe('create', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('can create a single resource', async () => {
    const result = await create(Post, {
      title: 'My post',
      body: 'Lorem ipsum...',
      created_at: String(new Date()),
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

    expect(result.validationErrors.email).toEqual(expect.arrayContaining(['email is required']))
  })

  it('can respond with standard errors', async () => {
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])

    const result = await create(User, {})

    expect(result.standardErrors[0]).toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })
  })

  it('can notify on error', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        create: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'create')

    await create(Post, {}, { notifyOnError: true })

    expect(notifyOnErrorSpy).toHaveBeenCalledOnce()
  })

  it('does not notify on error by default', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        create: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'create')

    await create(Post, {})

    expect(notifyOnErrorSpy).not.toHaveBeenCalled()
  })

  it('has a first preference for notifyOnError passed as a param', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { create: false }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        create: () => { return {} },
      },
      notifyOnError: { create: false },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'create')

    await create(Post, {}, { notifyOnError: true }) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a second preference for notifyOnError set at a "state.driver.config" level', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { create: false }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        create: () => { return {} },
      },
      notifyOnError: { create: true },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'create')

    await create(Post, {}) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a third preference for notifyOnError set at a "state.config" level', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { create: true }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        create: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'create')

    await create(Post, {}) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('does not throw if "options.throw" is false', async () => {
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])
    expect(async () => await create(Post, { title: 'beep' })).not.toThrow()
  })

  it('has first precedence for options.throw', async () => {
    vueModelState.drivers.local.config.throw = false
    vueModelState.config.throw = false
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])

    expect(async () => await create(Post, { title: 'beep' }, { throw: true })).rejects.toThrow()
  })

  it('has second precedence for options.driver.throw', async () => {
    vueModelState.drivers.local.config.throw = true
    vueModelState.config.throw = false
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])

    expect(async () => await create(Post, { title: 'beep' })).rejects.toThrow()
  })

  it('has third precedence for options.throw', async () => {
    vueModelState.config.throw = true
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])

    expect(async () => await create(Post, { title: 'beep' })).rejects.toThrow()
  })
})
