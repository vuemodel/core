import { describe, beforeEach, it, expect } from 'vitest'
import { indexResources } from '@vuemodel/core'
import { Post, populateRecords } from '@vuemodel/sample-data'
import { baseSetup } from '../baseSetup'

describe('indexResources', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('can limit number or resources returned', async () => {
    await populateRecords('posts', 10)

    const response = await indexResources(Post, {
      pagination: {
        recordsPerPage: 5,
      },
    })

    expect(response.records.length).toEqual(5)
  })

  it('can paginate', async () => {
    await populateRecords('posts', 10)

    const response = await indexResources(Post, {
      pagination: {
        recordsPerPage: 5,
        page: 2,
      },
    })

    expect(response.records.length).toEqual(5)
    expect(response.records[0].id).toEqual('6')
    expect(response.records[1].id).toEqual('7')
    expect(response.records[2].id).toEqual('8')
    expect(response.records[3].id).toEqual('9')
    expect(response.records[4].id).toEqual('10')
  })

  it('sets a standard error if the page is a negative number', async () => {
    //
  })
})
