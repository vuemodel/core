import { describe, beforeEach, it, expect, vi } from 'vitest'
import { useIndexer, vueModelState } from '@vuemodel/core'
import { Photo, PhotoTag, Post, User, populateRecords } from '@vuemodel/sample-data'
import { useRepo } from 'pinia-orm'
import { baseSetup } from '../baseSetup'
import { nextTick, ref } from 'vue'
import { promiseState } from '../helpers/promiseState'
import { wait } from '../helpers/wait'
import { implementationSetupsMap } from '../implementations/implementationSetupsMap'

const setups = implementationSetupsMap[import.meta.env.IMPLEMENTATION ?? 'piniaLocalStorage']

describe('useIndexer', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('persists the records to the store after index()', async () => {
    await populateRecords('posts', 3)
    const postsRepo = useRepo(Post)

    const indexer = useIndexer(Post)
    await indexer.index()

    expect(postsRepo.all().length).toEqual(3)
  })

  it('does not persist the records to the store after index() when "persist" is false', async () => {
    await populateRecords('posts', 3)
    const postsRepo = useRepo(Post)

    const indexer = useIndexer(Post)
    await indexer.index()

    expect(postsRepo.all().length).toEqual(3)
    expect(postsRepo.query().where('title', 'qui est esse').first())
      .toHaveProperty('body', 'est rerum tempore vitae\nnsequi sint nihil reprehenderit dolor beatae ea dolores neque\nnfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nnqui aperiam non debitis possimus qui neque nisi nulla')
  })

  it('can index resources immediately', async () => {
    await populateRecords('posts', 15)

    const indexer = useIndexer(Post, { immediate: true })

    await vi.waitUntil(() => {
      return indexer.records.value?.length > 0
    })

    expect(indexer.records.value.length).greaterThan(0)
  })

  it('can set immediate globally', async () => {
    //
  })

  it('sets validation errors when the response has validation errors', async () => {
    const postsIndexer = useIndexer(Post)
    setups.setMockValidationErrors({
      'title[0]': ['title must be a string'],
    })

    await postsIndexer.index()

    expect(postsIndexer.validationErrors.value['title[0]'])
      .toEqual(expect.arrayContaining(['title must be a string']))
  })

  it('clears validation errors when a request is made', async () => {
    const postsIndexer = useIndexer(Post)
    setups.setMockValidationErrors({
      'title[0]': ['title must be a string'],
    })
    setups.setMockLatency(200)

    await postsIndexer.index()

    expect(postsIndexer.validationErrors.value['title[0]'])
      .toEqual(expect.arrayContaining(['title must be a string']))

    postsIndexer.index() // intentionally not awaited
    expect(postsIndexer.validationErrors.value)
      .toEqual({})
  })

  it('sets standard errors when the response has standard errors', async () => {
    const postsIndexer = useIndexer(Post)
    setups.setMockStandardErrors([{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }])

    await postsIndexer.index()

    expect(postsIndexer.standardErrors.value[0])
      .toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })
  })

  it('clears standard errors when a request is made', async () => {
    const postsIndexer = useIndexer(Post)
    setups.setMockStandardErrors([{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }])

    await postsIndexer.index()

    expect(postsIndexer.standardErrors.value[0])
      .toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })

    postsIndexer.index() // intentionally not awaited
    expect(postsIndexer.standardErrors.value)
      .toEqual([])
  })

  it('success and error responses have an "action" of "index"', async () => {
    const postsIndexer = useIndexer(Post)
    setups.setMockStandardErrors([{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }])

    await postsIndexer.index()

    expect(postsIndexer.response.value.action)
      .toEqual('index')

    setups.setMockStandardErrors([])
    await postsIndexer.index()

    expect(postsIndexer.response.value.action)
      .toEqual('index')
  })

  it('contains populated data in "indexer.record.value"', async () => {
    await populateRecords('users', 2)
    await populateRecords('posts', 15)
    await populateRecords('comments', 63)

    const postIndexer = useIndexer(User, {
      with: { posts: { comments: {} } },
    })
    await postIndexer.index()

    expect(postIndexer.records.value[1].posts[2].comments.length).toBe(3)
  })

  it('exposes "makeQuery" so dev can make their own query', async () => {
    await populateRecords('users', 2)
    await populateRecords('posts', 20)
    await populateRecords('comments', 80)

    const usersIndexer = useIndexer(User)
    await usersIndexer.index()

    const postIndexer = useIndexer(Post, {
      with: { comments: {} },
    })
    await postIndexer.index()

    const postsWithUser = postIndexer.makeQuery()
      .with('user')
      .get()

    expect(postsWithUser[0].user).toHaveProperty('name', 'Leanne Graham')
    expect(postsWithUser[0].comments[2]).toHaveProperty('name', 'odio adipisci rerum aut animi')
  })

  it('can filter nested records and get a filtered response', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 1)
    await populateRecords('comments', 3)

    const usersIndexer = useIndexer(User, {
      with: {
        posts: {
          comments: {
            email: { equals: 'Jayne_Kuhic@sydney.com' },
          },
        },
      },
    })

    await usersIndexer.index()

    expect(usersIndexer.response.value.records[0].posts[0].comments.length).toBe(1)
  })

  it('can filter nested records and get a filtered record', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 1)
    await populateRecords('comments', 3)

    const usersIndexer = useIndexer(User, {
      with: {
        posts: {
          comments: {
            email: { equals: 'Jayne_Kuhic@sydney.com' },
          },
        },
      },
    })

    await usersIndexer.index()

    expect(usersIndexer.records.value[0].posts[0].comments.length).toBe(1)
  })

  it('can order nested records and get a ordered response', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 1)
    await populateRecords('comments', 3)

    const usersIndexer = useIndexer(User, {
      with: {
        posts: {
          comments: {
            _orderBy: [{ field: 'name', direction: 'descending' }],
          },
        },
      },
    })
    await usersIndexer.index()

    expect(usersIndexer.response.value.records[0].posts[0].comments.map(post => post.id))
      .toMatchObject([
        '2',
        '3',
        '1',
      ])
  })

  it('can order nested records get ordered records', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 1)
    await populateRecords('comments', 3)

    const usersIndexer = useIndexer(User, {
      with: {
        posts: {
          comments: {
            _orderBy: [{ field: 'name', direction: 'descending' }],
          },
        },
      },
    })
    await usersIndexer.index()

    expect(usersIndexer.records.value[0].posts[0].comments.map(post => post.id))
      .toMatchObject([
        '2',
        '3',
        '1',
      ])
  })

  it('hits the "onSuccess" callback on success', async () => {
    //
  })

  it('hits the "onError" callback when there is a standard error', async () => {
    //
  })

  it('hits the "onError" callback when there is a validation error', async () => {
    //
  })

  it('hits the "onStandardError" callback when there are one or more standard errors', async () => {
    //
  })

  it('hits the "onValidationError" callback when there are one or more validation errors', async () => {
    //
  })

  it('can limit the records being indexed via "options.recordsPerPage"', async () => {
    await populateRecords('posts', 9)

    const indexer = useIndexer(Post, { pagination: { recordsPerPage: 3 } })
    await indexer.index()

    expect(indexer.records.value.length).toEqual(3)
  })

  it('can paginate via indexer.next()', async () => {
    await populateRecords('posts', 9)

    const indexer = useIndexer(Post, { pagination: { recordsPerPage: 3 } })
    await indexer.index()

    expect(indexer.records.value.length).toEqual(3)
    expect(indexer.records.value[1].title).toEqual('qui est esse')

    await indexer.next()
    expect(indexer.records.value.length).toEqual(3)
    expect(indexer.records.value[1].title).toEqual('nesciunt quas odio')
  })

  it('can paginate via indexer.previous()', async () => {
    await populateRecords('posts', 9)

    const indexer = useIndexer(Post, { pagination: { recordsPerPage: 3 } })
    await indexer.index()

    await indexer.next()
    expect(indexer.records.value.length).toEqual(3)
    expect(indexer.records.value[1].title).toEqual('nesciunt quas odio')

    await indexer.previous()
    expect(indexer.records.value.length).toEqual(3)
    expect(indexer.records.value[1].title).toEqual('qui est esse')
  })

  it('indexes the first page when using "indexer.next()", if there is no pagination data', async () => {
    await populateRecords('posts', 9)

    const indexer = useIndexer(Post, { pagination: { recordsPerPage: 3 } })

    await indexer.next()
    expect(indexer.records.value.length).toEqual(3)
    expect(indexer.records.value[1].title).toEqual('qui est esse')
  })

  it('indexes the first page when using "indexer.previous()", if there is no pagination data', async () => {
    await populateRecords('posts', 9)

    const indexer = useIndexer(Post, { pagination: { recordsPerPage: 3 } })

    await indexer.previous()
    expect(indexer.records.value.length).toEqual(3)
    expect(indexer.records.value[1].title).toEqual('qui est esse')
  })

  it('throws an error when calling "indexer.next()" when "recordsPerPage" is not set', async () => {
    await populateRecords('posts', 3)
    const indexer = useIndexer(Post)

    expect(() => indexer.next()).rejects.toThrowError('recordsPerPage')
  })

  it('throws an error when calling "indexer.previous()" when "recordsPerPage" is not set', async () => {
    await populateRecords('posts', 3)
    const indexer = useIndexer(Post)

    expect(() => indexer.previous()).rejects.toThrowError('recordsPerPage')
  })

  it('can navigate directly to a page via indexer.toPage()', async () => {
    await populateRecords('posts', 9)

    const indexer = useIndexer(Post, { pagination: { recordsPerPage: 3 } })

    await indexer.toPage(3)
    expect(indexer.records.value.length).toEqual(3)
    expect(indexer.records.value[0].title).toEqual('magnam facilis autem')
  })

  it('throws an error when calling "indexer.toPage()" when "recordsPerPage" is not set', async () => {
    await populateRecords('posts', 3)
    const indexer = useIndexer(Post)

    expect(() => indexer.toPage(1)).rejects.toThrowError('recordsPerPage')
  })

  it('can navigate directly to the first page via indexer.toFirstPage()', async () => {
    await populateRecords('posts', 6)
    const indexer = useIndexer(Post, { pagination: { recordsPerPage: 2 } })

    await indexer.next()
    await indexer.next()
    await indexer.toFirstPage()

    expect(indexer.records.value.length).toEqual(2)
    expect(indexer.records.value[1].title).toEqual('qui est esse')
  })

  it('throws an error when calling "indexer.toFirstPage()" when "recordsPerPage" is not set', async () => {
    await populateRecords('posts', 3)
    const indexer = useIndexer(Post)

    expect(() => indexer.toFirstPage()).rejects.toThrowError('recordsPerPage')
  })

  it('can navigate directly to the last page via indexer.toLastPage()', async () => {
    await populateRecords('posts', 6)
    const indexer = useIndexer(Post, { pagination: { recordsPerPage: 2 } })

    await indexer.toLastPage()

    expect(indexer.records.value.length).toEqual(2)
    expect(indexer.records.value[0].title).toEqual('nesciunt quas odio')
  })

  it('throws an error when calling "indexer.toLastPage()" when "recordsPerPage" is not set', async () => {
    await populateRecords('posts', 3)
    const indexer = useIndexer(Post)

    expect(() => indexer.toLastPage()).rejects.toThrowError('recordsPerPage')
  })

  it('can paginate immediately when "pagination.value.page" changes', async () => {
    await populateRecords('posts', 9)

    const indexer = useIndexer(Post, {
      paginateImmediate: true,
      pagination: { recordsPerPage: 3 },
    })

    await indexer.index()
    indexer.pagination.value.page = 3
    await nextTick()
    await vi.waitUntil(() => !indexer.indexing.value)

    expect(indexer.records.value[0].title).toEqual('magnam facilis autem')
  })

  it('can paginate immediately when "pagination.value.recordsPerPage" changes', async () => {
    await populateRecords('posts', 10)

    const indexer = useIndexer(Post, {
      paginateImmediate: true,
      pagination: { recordsPerPage: 2 },
    })

    await indexer.index()
    indexer.pagination.value.recordsPerPage = 5
    indexer.pagination.value.page = 2
    await nextTick()
    await vi.waitUntil(() => !indexer.indexing.value)

    expect(indexer.records.value[2].title).toEqual('dolorem dolore est ipsam')
  })

  it('has a first preference for "index({ recordsPerPage })"', async () => {
    await populateRecords('posts', 10)
    vueModelState.config.pagination = { recordsPerPage: 2 }
    vueModelState.drivers.local.config.pagination = { recordsPerPage: 3 }

    const indexer = useIndexer(Post, {
      pagination: { recordsPerPage: 4 },
    })

    await indexer.index({ recordsPerPage: 5 })

    expect(indexer.records.value.length).toEqual(5)
  })

  it('has a seconds preference for "options.pagination.value.recordsPerPage"', async () => {
    await populateRecords('posts', 10)
    vueModelState.config.pagination = { recordsPerPage: 2 }
    vueModelState.drivers.local.config.pagination = { recordsPerPage: 3 }

    const indexer = useIndexer(Post, {
      pagination: { recordsPerPage: 4 },
    })

    await indexer.index()

    expect(indexer.records.value.length).toEqual(4)
  })

  it('has a third preference for "config.driver.config.pagination.recordsPerPage"', async () => {
    await populateRecords('posts', 10)
    vueModelState.config.pagination = { recordsPerPage: 2 }
    vueModelState.drivers.local.config.pagination = { recordsPerPage: 3 }

    const indexer = useIndexer(Post)

    await indexer.index()

    expect(indexer.records.value.length).toEqual(3)
  })

  it('has a fourth preference for "config.pagination.recordsPerPage"', async () => {
    await populateRecords('posts', 10)
    vueModelState.config.pagination = { recordsPerPage: 2 }

    const indexer = useIndexer(Post)

    await indexer.index()

    expect(indexer.records.value.length).toEqual(2)
  })

  it('refreshes the current page when "index()" is called', async () => {
    await populateRecords('posts', 4)

    const indexer = useIndexer(Post, { pagination: { recordsPerPage: 2 } })

    await indexer.index()

    expect(indexer.records.value[1].title).toEqual('qui est esse')
    await indexer.index()
    // Consider testing writing a test similar to this for your implementation
    // and change the record below on the backend.
    expect(indexer.records.value[1].title).toEqual('qui est esse')
  })

  it('has an "indexer.isLastPage.value" of true when on the last page and false when not on the last page', async () => {
    await populateRecords('posts', 4)

    const indexer = useIndexer(Post, { pagination: { recordsPerPage: 2 } })

    await indexer.index()

    expect(indexer.isLastPage.value).toEqual(false)
    await indexer.next()
    expect(indexer.isLastPage.value).toEqual(true)
  })

  it('has an "indexer.isFirstPage.value" of true when on the first page and false when not on the first page', async () => {
    await populateRecords('posts', 4)

    const indexer = useIndexer(Post, { pagination: { recordsPerPage: 2 } })

    await indexer.index()

    expect(indexer.isFirstPage.value).toEqual(true)
    await indexer.next()
    expect(indexer.isFirstPage.value).toEqual(false)
  })

  it('sets a standard error when trying to navigate after the last page', async () => {
    await populateRecords('posts', 4)

    const indexer = useIndexer(Post, { pagination: { recordsPerPage: 2 } })

    await indexer.index()

    await indexer.next()
    await indexer.next()

    expect(indexer.standardErrors.value[0].message).toContain('last')
  })

  it('sets a standard error when trying to navigate before the first page', async () => {
    await populateRecords('posts', 2)

    const indexer = useIndexer(Post, { pagination: { recordsPerPage: 2 } })

    await indexer.index()
    await indexer.previous()

    expect(indexer.standardErrors.value[0].message).toContain('first')
  })

  it('can filter in a scope', async () => {
    await populateRecords('users', 10)
    vueModelState.config.scopes = {
      defaultTenant: {
        filters: {
          tenant_id: {
            equals: '2',
          },
        },
      },
    }

    const usersIndexer = useIndexer(User, {
      scopes: { defaultTenant: {} },
    })
    await usersIndexer.index()

    expect(usersIndexer.records.value.length).toEqual(4)
  })

  it('can order in a scope', async () => {
    await populateRecords('users', 10)
    vueModelState.config.scopes = {
      orderByName: {
        orderBy: [
          { field: 'username', direction: 'ascending' },
        ],
      },
    }

    const usersIndexer = useIndexer(User, {
      scopes: { orderByName: {} },
    })
    await usersIndexer.index()

    expect(usersIndexer.records.value[0].username).toEqual('Antonette')
  })

  it('can populate in a scope', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 1)
    await populateRecords('comments', 6)
    vueModelState.config.scopes = {
      withPosts: {
        with: {
          posts: { comments: {} },
        },
      },
    }

    const usersIndexer = useIndexer(User, {
      scopes: { withPosts: {} },
    })
    await usersIndexer.index()

    expect(usersIndexer.records.value[0].posts[0].comments.length).toEqual(5)
  })

  it('can pass an array with strings to scope', async () => {
    await populateRecords('users', 5)
    vueModelState.config.scopes = {
      defaultTenant: {
        filters: {
          tenant_id: { equals: '2' },
        },
      },
    }

    const usersIndexer = useIndexer(User, {
      scopes: ['defaultTenant'],
    })
    await usersIndexer.index()

    expect(usersIndexer.records.value.length).toEqual(3)
  })

  it('can pass an array with objects to scope', async () => {
    await populateRecords('users', 5)
    vueModelState.config.scopes = {
      whereTenantId: (_context, payload: { tenantId: string }) => {
        return {
          filters: {
            tenant_id: { equals: payload.tenantId },
          },
        }
      },
    }

    const usersIndexer = useIndexer(User, {
      scopes: [{ name: 'whereTenantId', paramaters: { tenantId: '1' } }],
    })
    await usersIndexer.index()

    expect(usersIndexer.records.value.length).toEqual(2)
  })

  it('can pass a ref to "useIndexer({ scopes })"', async () => {
    await populateRecords('users', 5)
    vueModelState.config.scopes = {
      primaryTenant: {
        filters: {
          tenant_id: { equals: '1' },
        },
      },
      secondaryTenant: {
        filters: {
          tenant_id: { equals: '2' },
        },
      },
    }

    const scopes = ref(['primaryTenant'])
    const usersIndexer = useIndexer(User, {
      scopes,
    })

    await usersIndexer.index()
    expect(usersIndexer.records.value.length).toEqual(2)

    scopes.value = ['secondaryTenant']
    await usersIndexer.index()
    expect(usersIndexer.records.value.length).toEqual(3)
  })

  it('can apply a scope via "config.scopes"', async () => {
    await populateRecords('users', 10)
    vueModelState.config.scopes = {
      defaultTenant: () => {
        return {
          filters: {
            tenant_id: {
              equals: '2',
            },
          },
        }
      },
    }

    const usersIndexer = useIndexer(User, {
      scopes: { defaultTenant: {} },
    })
    await usersIndexer.index()

    expect(usersIndexer.records.value.length).toEqual(4)
  })

  it('can apply a scope via "config.entityScopes"', async () => {
    await populateRecords('users', 10)
    vueModelState.config.entityScopes = {
      users: {
        defaultTenant: {
          filters: {
            tenant_id: {
              equals: '2',
            },
          },
        },
      },
    }

    const usersIndexer = useIndexer(User, {
      scopes: { defaultTenant: {} },
    })
    await usersIndexer.index()

    expect(usersIndexer.records.value.length).toEqual(4)
  })

  it('can apply a scope via "config.entityScopes" (function)', async () => {
    await populateRecords('users', 10)
    vueModelState.config.entityScopes = {
      users: {
        defaultTenant: () => {
          return {
            filters: {
              tenant_id: {
                equals: '2',
              },
            },
          }
        },
      },
    }

    const usersIndexer = useIndexer(User, {
      scopes: { defaultTenant: {} },
    })
    await usersIndexer.index()

    expect(usersIndexer.records.value.length).toEqual(4)
  })

  it('can apply a scope globally via "config.globallyAppliedScopes"', async () => {
    await populateRecords('users', 10)
    vueModelState.config.scopes = {
      defaultTenant: {
        filters: {
          tenant_id: {
            equals: '2',
          },
        },
      },
    }
    vueModelState.config.globallyAppliedScopes = ['defaultTenant']

    const usersIndexer = useIndexer(User)
    await usersIndexer.index()

    expect(usersIndexer.records.value.length).toEqual(4)
  })

  it('can apply a scope globally via "config.globallyAppliedScopes"', async () => {
    await populateRecords('users', 10)
    vueModelState.config.scopes = {
      tenant: (_context, payload: { tenantId: string }) => {
        return {
          filters: {
            tenant_id: {
              equals: payload.tenantId,
            },
          },
        }
      },
    }
    const tenantId = ref('1')
    vueModelState.config.globallyAppliedScopes = [{ name: 'tenant', paramaters () { return { tenantId: tenantId.value } } }]

    const usersIndexer = useIndexer(User)
    await usersIndexer.index()
    expect(usersIndexer.records.value.length).toEqual(2)

    tenantId.value = '2'
    await usersIndexer.index()
    expect(usersIndexer.records.value.length).toEqual(4)
  })

  it('can apply an entity scope globally via "config.globallyAppliedEntityScopes"', async () => {
    await populateRecords('users', 10)
    vueModelState.config.entityScopes = {
      users: {
        defaultTenant: {
          filters: {
            tenant_id: {
              equals: '2',
            },
          },
        },
      },
    }
    vueModelState.config.globallyAppliedEntityScopes = {
      users: ['defaultTenant'],
    }

    const usersIndexer = useIndexer(User)
    await usersIndexer.index()

    expect(usersIndexer.records.value.length).toEqual(4)
  })

  it('can apply an entity scope globally via "config.globallyAppliedEntityScopes"', async () => {
    await populateRecords('users', 10)
    vueModelState.config.entityScopes = {
      users: {
        tenant: (_context, payload: { tenantId: string }) => {
          return {
            filters: {
              tenant_id: {
                equals: payload.tenantId,
              },
            },
          }
        },
      },
    }
    const tenantId = ref('1')
    vueModelState.config.globallyAppliedEntityScopes = {
      users: [{ name: 'tenant', paramaters: () => ({ tenantId: tenantId.value }) }],
    }

    const usersIndexer = useIndexer(User)
    await usersIndexer.index()
    expect(usersIndexer.records.value.length).toEqual(2)

    tenantId.value = '2'
    await usersIndexer.index()
    expect(usersIndexer.records.value.length).toEqual(4)
  })

  it('can disable a global scope with "withoutGlobalScopes"', async () => {
    await populateRecords('users', 10)
    vueModelState.config.scopes = {
      defaultTenant: {
        filters: {
          tenant_id: {
            equals: '2',
          },
        },
      },
    }
    vueModelState.config.globallyAppliedScopes = ['defaultTenant']

    const usersIndexer = useIndexer(User, { withoutGlobalScopes: ['defaultTenant'] })
    await usersIndexer.index()

    expect(usersIndexer.records.value.length).toEqual(10)
  })

  it('can disable an entity global scope with "withoutEntityGlobalScopes"', async () => {
    await populateRecords('users', 10)
    vueModelState.config.entityScopes = {
      users: {
        defaultTenant: {
          filters: {
            tenant_id: {
              equals: '2',
            },
          },
        },
      },
    }
    vueModelState.config.globallyAppliedEntityScopes = { users: ['defaultTenant'] }

    const usersIndexer = useIndexer(User, { withoutEntityGlobalScopes: ['defaultTenant'] })
    await usersIndexer.index()

    expect(usersIndexer.records.value.length).toEqual(10)
  })

  it('merges scopes correctly', async () => {
    await populateRecords('users', 10)
    vueModelState.config.entityScopes = {
      users: { nameStartC: { filters: { name: { startsWith: 'C' } } } },
    }
    vueModelState.config.scopes = {
      defaultTenant: { filters: { tenant_id: { equals: '2' } } },
    }
    vueModelState.config.globallyAppliedEntityScopes = { users: ['nameStartC'] }
    vueModelState.config.globallyAppliedScopes = ['defaultTenant']

    const usersIndexer = useIndexer(User)
    await usersIndexer.index()

    expect(usersIndexer.records.value.length).toEqual(2)
  })

  it('applys global scopes to nested resources', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 10)
    vueModelState.config.entityScopes = {
      posts: {
        titleStartE: { filters: { title: { startsWith: 'e' } } },
      },
    }
    vueModelState.config.globallyAppliedEntityScopes = {
      posts: ['titleStartE'],
    }

    const usersIndexer = useIndexer(User, { with: { posts: {} } })
    await usersIndexer.index()

    expect(usersIndexer.records.value[0].posts.length).toEqual(2)
  })

  it('can persist by "insert"', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 5)

    const usersIndexer = useIndexer(User, {
      with: { posts: {} },
      persistBy: 'insert',
    })
    await usersIndexer.index()

    expect(usersIndexer.records.value[0].posts.length).toEqual(0)
  })

  it('can persist by "replace-save"', async () => {
    await populateRecords('users', 4)
    await populateRecords('posts', 5)
    const userRepo = useRepo(User)

    const usersIndexer = useIndexer(User, {
      with: { posts: {} },
      pagination: { recordsPerPage: 2 },
      persistBy: 'replace-save',
    })
    await usersIndexer.index()

    expect(usersIndexer.records.value[0].posts.length).toEqual(5)
    expect(userRepo.all().length).toEqual(2)

    await usersIndexer.next()
    expect(userRepo.all().length).toEqual(2)
  })

  it('can persist by "replace-insert"', async () => {
    await populateRecords('users', 4)
    await populateRecords('posts', 5)
    const userRepo = useRepo(User)

    const usersIndexer = useIndexer(User, {
      with: { posts: {} },
      pagination: { recordsPerPage: 2 },
      persistBy: 'replace-insert',
    })
    await usersIndexer.index()

    expect(usersIndexer.records.value[0].posts.length).toEqual(0)
    expect(userRepo.all().length).toEqual(2)

    await usersIndexer.next()
    expect(userRepo.all().length).toEqual(2)
  })

  it('can index an array of ids via indexer.index(idsArray)', async () => {
    await populateRecords('posts', 5)

    const postsIndexer = useIndexer(Post)
    await postsIndexer.index(['1', '2', '5'])

    expect(postsIndexer.records.value.map(record => record.id))
      .toMatchObject(['1', '2', '5'])
  })

  it('can index an array of ids via indexer.options.whereIdIn', async () => {
    await populateRecords('posts', 5)

    const postsIndexer = useIndexer(Post, { whereIdIn: [1, 2, 5] })
    await postsIndexer.index()

    expect(postsIndexer.records.value.map(record => record.id))
      .toMatchObject(['1', '2', '5'])
  })

  it('has highest precedence for ids from indexer.index(idsArray)', async () => {
    await populateRecords('posts', 5)

    const postsIndexer = useIndexer(Post, { whereIdIn: [1, 2, 5] })
    await postsIndexer.index([3, 4])

    expect(postsIndexer.records.value.map(record => record.id))
      .toEqual(expect.arrayContaining(['3', '4']))
  })

  it('it immediately submit a request when indexer.ids.value changes, and options.idsImmediate is true', async () => {
    await populateRecords('posts', 5)

    const whereIdIn = ref([])
    const postsIndexer = useIndexer(Post, {
      whereIdIn,
      whereIdInImmediate: true,
    })
    whereIdIn.value = [3, 4]

    await nextTick()
    await vi.waitUntil(() => !postsIndexer.indexing.value)
    expect(postsIndexer.records.value.map(record => record.id))
      .toEqual(expect.arrayContaining(['3', '4']))
  })

  it('can index records that have a composite key', async () => {
    await populateRecords('photo_tags', 5)

    const photoTagsIndexer = useIndexer(PhotoTag)
    await photoTagsIndexer.index()

    expect(photoTagsIndexer.response.value.records.length)
      .toEqual(5)
  })

  it('can index records that have a composite key using "index(ids)"', async () => {
    await populateRecords('photo_tags', 5)

    const photoTagsIndexer = useIndexer(PhotoTag)
    await photoTagsIndexer.index([['1', '1'], ['2', '1'], ['4', '3']])

    expect(photoTagsIndexer.response.value.records)
      .toMatchObject([
        {
          photo_id: '1',
          tag_id: '1',
        },
        {
          photo_id: '2',
          tag_id: '1',
        },
        {
          photo_id: '4',
          tag_id: '3',
        },
      ])
  })

  it('can index records that have a composite key using "indexer.options.whereIdIn"', async () => {
    await populateRecords('photo_tags', 5)

    const photoTagsIndexer = useIndexer(PhotoTag, {
      whereIdIn: [['1', '1'], ['2', '1'], ['4', '3']],
    })
    await photoTagsIndexer.index()

    expect(photoTagsIndexer.response.value.records)
      .toMatchObject([
        {
          photo_id: '1',
          tag_id: '1',
        },
        {
          photo_id: '2',
          tag_id: '1',
        },
        {
          photo_id: '4',
          tag_id: '3',
        },
      ])
  })

  it('can access records from "indexer.records.value" when indexing with composite keys', async () => {
    await populateRecords('photo_tags', 5)

    const photoTagsIndexer = useIndexer(PhotoTag)
    await photoTagsIndexer.index([['1', '1'], ['2', '1'], ['4', '3']])

    expect(photoTagsIndexer.records.value)
      .toMatchObject([
        {
          photo_id: '1',
          tag_id: '1',
        },
        {
          photo_id: '2',
          tag_id: '1',
        },
        {
          photo_id: '4',
          tag_id: '3',
        },
      ])
  })

  it('can populate a related record where the related record has a composite key', async () => {
    await populateRecords('photo_tags', 10)
    await populateRecords('photos', 20)

    const photosIndexer = useIndexer(Photo, { with: { photo_tags: {} } })
    await photosIndexer.index()

    expect(photosIndexer.records.value[0].photo_tags.length)
      .toEqual(2)
  })

  it('can index records from a resource where the primaryKey is not "id"', async () => {
    //
  })

  it('can cancel the latest request', async () => {
    await populateRecords('posts', 10)
    setups.setMockLatency(100)

    const postsIndexer = useIndexer(Post)
    const indexRequest = postsIndexer.index()
    postsIndexer.cancel()
    await indexRequest

    expect(postsIndexer.standardErrors.value[0].message)
      .toContain('abort')
  })

  it('cancels the first request if a second request is made and the first is not done yet', async () => {
    await populateRecords('posts', 10)
    setups.setMockLatency(100)

    const postsIndexer = useIndexer(Post)
    const indexRequestA = postsIndexer.index()
    const indexRequestB = postsIndexer.index()

    await wait(50)
    const indexRequestAPromiseState = await promiseState(indexRequestA)
    const indexRequestBPromiseState = await promiseState(indexRequestB)
    expect(indexRequestAPromiseState.status).toEqual('fulfilled')
    expect(indexRequestBPromiseState.status).toEqual('pending')

    await indexRequestB

    expect(postsIndexer.standardErrors.value.length)
      .toEqual(0)
    expect(postsIndexer.records.value.length)
      .toEqual(10)
  })

  it('can notify on error', async () => {
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])
    vueModelState.config.errorNotifiers = {
      index: () => {
        return ''
      },
    }

    const indexErrorNotifierSpy = vi.spyOn(vueModelState.config.errorNotifiers, 'index')

    const postIndexer = useIndexer(User, { notifyOnError: true })
    await postIndexer.index(['1'])

    expect(indexErrorNotifierSpy).toHaveBeenCalled()
  })

  it('can nested filter', async () => {
    await populateRecords('users', 10)
    await populateRecords('posts', 10)
    await populateRecords('comments', 10)

    const postIndexer = useIndexer(User, {
      filters: {
        age: {
          greaterThan: 3,
        },
        posts: {
          title: {
            equals: 'qui est esse',
          },
          comments: {
            email: { equals: 'Dallas@ole.me' },
          },
        },
      },
    })

    await postIndexer.index()

    expect(postIndexer.records.value.length).toEqual(1)
    expect(postIndexer.records.value[0].name).toEqual('Leanne Graham')
  })

  it('can use a creator to add created records', async () => {
    //
  })
})
