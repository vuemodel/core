import { describe, beforeEach, it, expect, vi } from 'vitest'
import { index, destroy, vueModelState } from '@vuemodel/core'
import { Post, populateRecords } from '@vuemodel/sample-data'
import { baseSetup } from '../baseSetup'
import 'fake-indexeddb/auto'
import { implementationSetupsMap } from '../implementations/implementationSetupsMap'

const setups = implementationSetupsMap[import.meta.env.IMPLEMENTATION ?? 'piniaLocalStorage']

describe('destroy', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('can destroy a resource', async () => {
    await populateRecords('posts', 5)

    const result = await destroy(Post, '3')

    expect(result.record).toHaveProperty(
      'title',
      'ea molestias quasi exercitationem repellat qui ipsa sit aut',
    )
    const remainingPosts = await index(Post)
    expect(remainingPosts.records.length).toBe(4)
  })

  it('can respond with standard errors', async () => {
    setups.setMockStandardErrors([
      { message: 'something went horribly wrong', name: 'oops' },
    ])

    const result = await destroy(Post, '1')

    expect(result.standardErrors).toMatchObject([{ message: 'something went horribly wrong', name: 'oops' }])
  })

  it('can notify on error', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        destroy: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'destroy')

    await destroy(Post, '1', { notifyOnError: true })

    expect(notifyOnErrorSpy).toHaveBeenCalledOnce()
  })

  it('does not notify on error by default', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        destroy: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'destroy')

    await destroy(Post, '1')

    expect(notifyOnErrorSpy).not.toHaveBeenCalled()
  })

  it('has a first preference for notifyOnError passed as a param', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { destroy: false }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        destroy: () => { return {} },
      },
      notifyOnError: { destroy: false },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'destroy')

    await destroy(Post, '1', { notifyOnError: true }) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a second preference for notifyOnError set at a "state.driver.xxx.config" level', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { destroy: false }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        destroy: () => { return {} },
      },
      notifyOnError: { destroy: true },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'destroy')

    await destroy(Post, '1') // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a third preference for notifyOnError set at a "state.config" level', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { destroy: true }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        destroy: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'destroy')

    await destroy(Post, '1') // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('returns a standard error if the id does not exist', async () => {
    await populateRecords('posts', 2)

    const respone = await destroy(Post, '3')

    // to avoid being too specific about the message, we only ensure a message exists
    expect(respone.standardErrors[0].message).toBeTypeOf('string')
  })

  it('does not throw if "options.throw" is false', async () => {
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])
    await populateRecords('posts', 1)
    expect(async () => await destroy(Post, '1')).not.toThrow()
  })

  it('has first precedence for options.throw', async () => {
    vueModelState.drivers.local.config.throw = false
    vueModelState.config.throw = false
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])
    await populateRecords('posts', 1)

    expect(async () => await destroy(Post, '1', { throw: true })).rejects.toThrow()
  })

  it('has second precedence for options.driver.throw', async () => {
    vueModelState.drivers.local.config.throw = true
    vueModelState.config.throw = false
    await populateRecords('posts', 1)
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])

    expect(async () => await destroy(Post, '1')).rejects.toThrow()
  })

  it('has third precedence for options.throw', async () => {
    vueModelState.config.throw = true
    await populateRecords('posts', 1)
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])

    expect(async () => await destroy(Post, '1')).rejects.toThrow()
  })
})
