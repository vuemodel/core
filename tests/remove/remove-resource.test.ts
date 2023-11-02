import { describe, beforeEach, it, expect, vi } from 'vitest'
import { indexResources, removeResource, vueModelState } from '@vuemodel/core'
import { Post } from 'sample-data'
import { populateRecords } from '../helpers/populateRecords'
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage/src/plugin/state'
import { baseSetup } from '../baseSetup'

describe('removeResource', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('can remove a resource', async () => {
    await populateRecords('posts', 5)

    const result = await removeResource(Post, '3')

    expect(result.record).toHaveProperty(
      'title',
      'ea molestias quasi exercitationem repellat qui ipsa sit aut',
    )
    const remainingPosts = await indexResources(Post)
    expect(remainingPosts.records.length).toBe(4)
  })

  it('can respond with standard errors', async () => {
    piniaLocalStorageState.mockStandardErrors = [
      { message: 'something went horribly wrong', name: 'oops' },
    ]

    const result = await removeResource(Post, '1')

    expect(result.standardErrors).toMatchObject([{ message: 'something went horribly wrong', name: 'oops' }])
  })

  it('can notify on error', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        remove: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'remove')

    await removeResource(Post, '1', { notifyOnError: true })

    expect(notifyOnErrorSpy).toHaveBeenCalledOnce()
  })

  it('does not notify on error by default', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        remove: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'remove')

    await removeResource(Post, '1')

    expect(notifyOnErrorSpy).not.toHaveBeenCalled()
  })

  it('has a first preference for notifyOnError passed as a param', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.config.notifyOnError = { remove: false }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        remove: () => { return {} },
      },
      notifyOnError: { remove: false },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'remove')

    await removeResource(Post, '1', { notifyOnError: true }) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a second preference for notifyOnError set at a "state.driver.xxx.config" level', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.config.notifyOnError = { remove: false }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        remove: () => { return {} },
      },
      notifyOnError: { remove: true },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'remove')

    await removeResource(Post, '1') // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a third preference for notifyOnError set at a "state.config" level', async () => {
    piniaLocalStorageState.mockStandardErrors = [{ message: 'something went horribly wrong', name: 'oops' }]
    vueModelState.config.notifyOnError = { remove: true }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        remove: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'remove')

    await removeResource(Post, '1') // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })
})
