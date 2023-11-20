import { describe, beforeEach, it, expect, vi } from 'vitest'
import { index, vueModelState } from '@vuemodel/core'
import { Post, posts, populateRecords } from '@vuemodel/sample-data'
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage'
import { baseSetup } from '../baseSetup'
import 'fake-indexeddb/auto'
import { wait } from '../helpers/wait'

describe('index', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('can index resources', async () => {
    await populateRecords('posts', 3)

    const response = await index(Post)

    expect(response.records[0]).toMatchObject(posts[0])
    expect(response.records.length).toEqual(3)
  })

  it('can respond with validation errors', async () => {
    piniaLocalStorageState.mockValidationErrors = {
      'comments[0]': ['the "paramater" field is required'],
    }

    const result = await index(Post)

    expect(result.validationErrors['comments[0]']).toEqual(expect.arrayContaining(['the "paramater" field is required']))
  })

  it('can respond with standard errors', async () => {
    piniaLocalStorageState.mockStandardErrors = [
      { message: 'something went horribly wrong', name: 'oops' },
    ]

    const result = await index(Post)

    expect(result.standardErrors).toMatchObject([{ message: 'something went horribly wrong', name: 'oops' }])
  })

  it('can notify on error', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        index: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'index')

    await index(Post, { notifyOnError: true })

    expect(notifyOnErrorSpy).toHaveBeenCalledOnce()
  })

  it('does not notify on error by default', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        index: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'index')

    await index(Post)

    expect(notifyOnErrorSpy).not.toHaveBeenCalled()
  })

  it('has a first preference for notifyOnError passed as a param', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.config.notifyOnError = { index: false }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        index: () => { return {} },
      },
      notifyOnError: { index: false },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'index')

    await index(Post, { notifyOnError: true }) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a second preference for notifyOnError set at a "state.driver.xxx.config" level', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.config.notifyOnError = { index: false }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        index: () => { return {} },
      },
      notifyOnError: { index: true },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'index')

    await index(Post) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a third preference for notifyOnError set at a "state.config" level', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.config.notifyOnError = { index: true }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        index: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'index')

    await index(Post) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('can abort an index request (immediate)', async () => {
    await populateRecords('posts', 1)
    piniaLocalStorageState.mockLatencyMs = 500

    const controller = new AbortController()
    const signal = controller.signal

    controller.abort()
    const request = index(Post, { signal })

    const response = await request
    expect(response.success).toEqual(false)
    expect(response.standardErrors[0].message).toContain('aborted')
  })

  it('can abort an index request (not immediately)', async () => {
    await populateRecords('posts', 1)
    piniaLocalStorageState.mockLatencyMs = 500

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
    piniaLocalStorageState.mockStandardErrors = [{ name: 'oops', message: 'something went baaad!' }]
    expect(async () => await index(Post)).not.toThrow()
  })

  it('has first precedence for options.throw', async () => {
    vueModelState.drivers.local.config.throw = false
    vueModelState.config.throw = false
    piniaLocalStorageState.mockStandardErrors = [{ name: 'oops', message: 'something went baaad!' }]

    expect(async () => await index(Post, { throw: true })).rejects.toThrow()
  })

  it('has second precedence for options.driver.throw', async () => {
    vueModelState.drivers.local.config.throw = true
    vueModelState.config.throw = false
    piniaLocalStorageState.mockStandardErrors = [{ name: 'oops', message: 'something went baaad!' }]

    expect(async () => await index(Post)).rejects.toThrow()
  })

  it('has third precedence for options.throw', async () => {
    vueModelState.config.throw = true
    piniaLocalStorageState.mockStandardErrors = [{ name: 'oops', message: 'something went baaad!' }]

    expect(async () => await index(Post)).rejects.toThrow()
  })
})
