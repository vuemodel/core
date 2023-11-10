import { describe, beforeEach, it, expect, vi } from 'vitest'
import { indexResources, vueModelState } from '@vuemodel/core'
import { Post, posts, populateRecords } from '@vuemodel/sample-data'
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage'
import { baseSetup } from '../baseSetup'
import 'fake-indexeddb/auto'

describe('indexResources', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('can index resources', async () => {
    await populateRecords('posts', 3)

    const response = await indexResources(Post)

    expect(response.records[0]).toMatchObject(posts[0])
    expect(response.records.length).toEqual(3)
  })

  it('can respond with validation errors', async () => {
    piniaLocalStorageState.mockValidationErrors = {
      'comments[0]': ['the "paramater" field is required'],
    }

    const result = await indexResources(Post)

    expect(result.validationErrors['comments[0]']).toEqual(expect.arrayContaining(['the "paramater" field is required']))
  })

  it('can respond with standard errors', async () => {
    piniaLocalStorageState.mockStandardErrors = [
      { message: 'something went horribly wrong', name: 'oops' },
    ]

    const result = await indexResources(Post)

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

    await indexResources(Post, { notifyOnError: true })

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

    await indexResources(Post)

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

    await indexResources(Post, { notifyOnError: true }) // as param takes precedence

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

    await indexResources(Post) // as param takes precedence

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

    await indexResources(Post) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })
})
