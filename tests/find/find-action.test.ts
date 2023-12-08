import { describe, beforeEach, it, expect, vi } from 'vitest'
import { find, vueModelState } from '@vuemodel/core'
import { Post, populateRecords } from '@vuemodel/sample-data'
import { baseSetup } from '../baseSetup'
import 'fake-indexeddb/auto'
import { implementationSetupsMap } from '../implementations/implementationSetupsMap'

const setups = implementationSetupsMap[import.meta.env.IMPLEMENTATION ?? 'piniaLocalStorage']

describe('find', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('can find a resource', async () => {
    await populateRecords('posts', 5)

    const result = await find(Post, '3')

    expect(result.record).toHaveProperty(
      'title',
      'ea molestias quasi exercitationem repellat qui ipsa sit aut',
    )
  })

  it('can populate records', async () => {
    await populateRecords('posts', 5)
    await populateRecords('comments', 5)

    const result = await find(Post, '1', {
      with: {
        comments: {},
      },
    })

    expect(result.record.comments.length).toEqual(5)
    expect(result.record.comments[0]).toHaveProperty('name', 'id labore ex et quam laborum')
  })

  it('can filter nested records', async () => {
    await populateRecords('posts', 5)
    await populateRecords('comments', 5)

    const result = await find(Post, '1', {
      with: {
        comments: {
          name: { equals: 'vero eaque aliquid doloribus et culpa' },
        },
      },
    })

    expect(result.record.comments.length).toEqual(1)
    expect(result.record.comments[0]).toHaveProperty('name', 'vero eaque aliquid doloribus et culpa')
  })

  it('can order nested records', async () => {
    await populateRecords('posts', 5)
    await populateRecords('comments', 5)

    const result = await find(Post, '1', {
      with: {
        comments: {
          _orderBy: [{ direction: 'ascending', field: 'name' }],
        },
      },
    })

    expect(result.record.comments.map(comment => comment.id))
      .toMatchObject(['4', '1', '3', '2', '5'])
  })

  it('can respond with validation errors', async () => {
    setups.setMockValidationErrors({
      'comments[0]': ['the "paramater" field is required'],
    })

    const result = await find(Post, '1')

    expect(result.validationErrors['comments[0]']).toEqual(expect.arrayContaining(['the "paramater" field is required']))
  })

  it('can respond with standard errors', async () => {
    setups.setMockStandardErrors([
      { message: 'something went horribly wrong', name: 'oops' },
    ])

    const result = await find(Post, '1')

    expect(result.standardErrors).toMatchObject([{ message: 'something went horribly wrong', name: 'oops' }])
  })

  it('can notify on error', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        find: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'find')

    await find(Post, '1', { notifyOnError: true })

    expect(notifyOnErrorSpy).toHaveBeenCalledOnce()
  })

  it('does not notify on error by default', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        find: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'find')

    await find(Post, '1')

    expect(notifyOnErrorSpy).not.toHaveBeenCalled()
  })

  it('has a first preference for notifyOnError passed as a param', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { find: false }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        find: () => { return {} },
      },
      notifyOnError: { find: false },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'find')

    await find(Post, '1', { notifyOnError: true }) // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a second preference for notifyOnError set at a "state.driver.xxx.config" level', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { find: false }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        find: () => { return {} },
      },
      notifyOnError: { find: true },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'find')

    await find(Post, '1') // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('has a third preference for notifyOnError set at a "state.config" level', async () => {
    setups.setMockStandardErrors([{ message: 'something went horribly wrong', name: 'oops' }])
    vueModelState.config.notifyOnError = { find: true }
    vueModelState.drivers.local.config = {
      errorNotifiers: {
        find: () => { return {} },
      },
    }
    const notifyOnErrorSpy = vi.spyOn(vueModelState.drivers.local.config.errorNotifiers, 'find')

    await find(Post, '1') // as param takes precedence

    expect(notifyOnErrorSpy).toHaveBeenCalled()
  })

  it('does not throw if "options.throw" is false', async () => {
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])
    expect(async () => await find(Post, '1')).not.toThrow()
  })

  it('has first precedence for options.throw', async () => {
    vueModelState.drivers.local.config.throw = false
    vueModelState.config.throw = false
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])

    expect(async () => await find(Post, '1', { throw: true })).rejects.toThrow()
  })

  it('has second precedence for options.driver.throw', async () => {
    vueModelState.drivers.local.config.throw = true
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])
    vueModelState.config.throw = false

    expect(async () => await find(Post, '1')).rejects.toThrow()
  })

  it('has third precedence for options.throw', async () => {
    setups.setMockStandardErrors([{ name: 'oops', message: 'something went baaad!' }])
    vueModelState.config.throw = true

    expect(async () => await find(Post, '1')).rejects.toThrow()
  })
})
