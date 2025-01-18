import { describe, beforeEach, it, expect, vi } from 'vitest'
import { index } from '@vuemodel/core'
import { User, populateRecords } from '@vuemodel/sample-data'
import { baseSetup } from '../baseSetup'
import { driverSetupsMap } from '../drivers/driverSetupsMap'

const setups = driverSetupsMap[import.meta.env.IMPLEMENTATION ?? 'piniaLocalStorage']

describe('index', () => {
  beforeEach(async (ctx) => {
    await baseSetup(ctx)
  })

  it('can populate a resource', async () => {
    await setups.populateRecords('users', 1)
    await setups.populateRecords('posts', 5)

    const response = await index(User, {
      with: {
        posts: {},
      },
    })

    expect(response.records.length).toEqual(1)
    expect(response.records[0].posts.length).toEqual(5)
  })

  it('can populate multiple resources', async () => {
    await setups.populateRecords('users', 1)
    await setups.populateRecords('posts', 5)
    await setups.populateRecords('albums', 5)

    const response = await index(User, {
      with: {
        posts: {},
        albums: {},
      },
    })

    expect(response.records[0].posts.length).toEqual(5)
    expect(response.records[0].posts.length).toEqual(5)
    expect(response.records[0].albums.length).toEqual(3)
  })

  it('can nested populate', async () => {
    await setups.populateRecords('users', 1)
    await setups.populateRecords('posts', 5)
    await setups.populateRecords('comments', 5)

    const response = await index(User, {
      with: {
        posts: {
          comments: {},
        },
      },
    })

    expect(response.records[0].posts.length).toEqual(5)
    expect(response.records[0].posts[0].comments.length).toEqual(5)
  })

  it('can filter nested records', async () => {
    await setups.populateRecords('users', 1)
    await setups.populateRecords('posts', 20)
    await setups.populateRecords('comments', 20)

    const response = await index(User, {
      with: {
        posts: {
          title: {
            contains: 'optio',
          },
          comments: {
            name: { equals: 'alias odio sit' },
          },
        },
      },
    })

    expect(response.records[0].posts.length).toEqual(2)
    expect(response.records[0].posts.map(post => post.id))
      .toEqual(expect.arrayContaining([
        '1',
        '10',
      ]))

    const comments = response.records[0].posts[0].comments
    expect(comments.length).toEqual(1)
    expect(comments[0].name).toEqual('alias odio sit')
  })

  it('can order nested records', async () => {
    if (!setups.driver.features.find.order.nested) {
      const consoleMock = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      await index(User, {
        with: {
          posts: {
            _orderBy: [
              { field: 'title', direction: 'ascending' },
            ],
          },
        },
      })
      expect(consoleMock).toHaveBeenCalledWith('driver "testDriver" does not support feature "find.order.nested"')
      return
    }

    await setups.populateRecords('users', 1)
    await setups.populateRecords('posts', 5)

    const response = await index(User, {
      with: {
        posts: {
          _orderBy: [
            { field: 'title', direction: 'ascending' },
          ],
        },
      },
    })

    expect(response.records[0].posts.map(post => post.id))
      .toMatchObject([
        '3',
        '4',
        '5',
        '2',
        '1',
      ])
  })

  it('can filter nested records', async () => {
    //
  })
})
