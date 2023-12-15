import { describe, beforeEach, it, expect } from 'vitest'
import { index } from '@vuemodel/core'
import { User, populateRecords } from '@vuemodel/sample-data'
import { baseSetup } from '../baseSetup'

describe('index', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('can populate a resource', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 5)

    const response = await index(User, {
      with: {
        posts: {},
      },
    })

    expect(response.records.length).toEqual(1)
    expect(response.records[0].posts.length).toEqual(5)
  })

  it('can populate multiple resources', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 5)
    await populateRecords('albums', 5)

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
    await populateRecords('users', 1)
    await populateRecords('posts', 5)
    await populateRecords('comments', 5)

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
    await populateRecords('users', 1)
    await populateRecords('posts', 20)
    await populateRecords('comments', 20)

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
    await populateRecords('users', 1)
    await populateRecords('posts', 5)

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
