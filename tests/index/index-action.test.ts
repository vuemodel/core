import { describe, beforeEach, it, expect, vi } from 'vitest'
import { index, vueModelState } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { baseSetup } from '../baseSetup'
import 'fake-indexeddb/auto'
import { wait } from '../helpers/wait'
import { driverSetupsMap } from '../drivers/driverSetupsMap'

const setups = driverSetupsMap[import.meta.env.IMPLEMENTATION ?? 'piniaLocalStorage']

describe('index', () => {
  beforeEach(async (ctx) => {
    await baseSetup(ctx)
  })

  it('can index resources', async () => {
    await setups.populateRecords('posts', 3)

    const response = await index(Post)

    expect(response.records.length).toEqual(3)
  })

  it('can respond with validation errors', async () => {
    setups.setMockValidationErrors({
      'comments[0]': ['the "parameter" field is required'],
    })

    const result = await index(Post)

    expect(result.validationErrors['comments[0]']).toEqual(expect.arrayContaining(['the "parameter" field is required']))
  })

  it('can respond with standard errors', async () => {
    setups.setMockStandardErrors([
      { message: 'something went horribly wrong', name: 'oops' },
    ])

    const result = await index(Post)

    expect(result.standardErrors).toMatchObject([{ message: 'something went horribly wrong', name: 'oops' }])
  })

  it('can notify on error', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.drivers.testDriver.config = {
      errorNotifiers: {
        index: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.testDriver.config.errorNotifiers, 'index')

    await index(Post, { notifyOnError: true })

    expect(notifyOnErrorSpy).toHaveBeenCalledOnce()
  })

  it('does not notify on error by default', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.drivers.testDriver.config = {
      errorNotifiers: {
        index: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.testDriver.config.errorNotifiers, 'index')

    await index(Post)

    expect(notifyOnErrorSpy).not.toHaveBeenCalled()
  })

  it('has a first preference for notifyOnError passed as a param', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { index: false }
    vueModelState.drivers.testDriver.config = {
      errorNotifiers: {
        index: () => { return {} },
      },
      notifyOnError: { index: false },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.testDriver.config.errorNotifiers, 'index')

    await index(Post, { notifyOnError: true }) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a second preference for notifyOnError set at a "state.driver.xxx.config" level', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { index: false }
    vueModelState.drivers.testDriver.config = {
      errorNotifiers: {
        index: () => { return {} },
      },
      notifyOnError: { index: true },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.testDriver.config.errorNotifiers, 'index')

    await index(Post) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a third preference for notifyOnError set at a "state.config" level', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { index: true }
    vueModelState.drivers.testDriver.config = {
      errorNotifiers: {
        index: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.testDriver.config.errorNotifiers, 'index')

    await index(Post) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('can abort an index request (immediate)', async () => {
    await setups.populateRecords('posts', 1)
    setups.setMockLatency(500)

    const controller = new AbortController()
    const signal = controller.signal

    controller.abort()
    const request = index(Post, { signal })

    const response = await request
    expect(response.success).toEqual(false)
    expect(response.standardErrors[0].message).toContain('aborted')
  })

  it('can abort an index request (not immediately)', async () => {
    await setups.populateRecords('posts', 1)
    setups.setMockLatency(500)

    const controller = new AbortController()
    const signal = controller.signal

    const request = index(Post, { signal })
    await wait(100)
    controller.abort()

    const response = await request
    expect(response.success).toEqual(false)
    expect(response.standardErrors[0].message).toContain('aborted')
  })

  it('does not throw if "options.throw" is false', async () => {
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])

    expect(async () => await index(Post)).not.toThrow()
  })

  it('has first precedence for options.throw', async () => {
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])
    vueModelState.drivers.testDriver.config.throw = false
    vueModelState.config.throw = false

    expect(async () => await index(Post, { throw: true })).rejects.toThrow()
  })

  it('has second precedence for options.driver.throw', async () => {
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])
    vueModelState.drivers.testDriver.config.throw = true
    vueModelState.config.throw = false

    expect(async () => await index(Post)).rejects.toThrow()
  })

  it('has third precedence for options.throw', async () => {
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])
    vueModelState.config.throw = true

    expect(async () => await index(Post)).rejects.toThrow()
  })
})
