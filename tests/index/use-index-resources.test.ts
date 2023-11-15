import { describe, beforeEach, it, expect, vi } from 'vitest'
import { useIndexResources, vueModelState } from '@vuemodel/core'
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage'
import { Post, User, populateRecords } from '@vuemodel/sample-data'
import { useRepo } from 'pinia-orm'
import { baseSetup } from '../baseSetup'
import { nextTick, ref } from 'vue'

describe('useIndexResources', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('persists the records to the store after index()', async () => {
    await populateRecords('posts', 3)
    const postsRepo = useRepo(Post)

    const indexer = useIndexResources(Post)
    await indexer.index()

    expect(postsRepo.all().length).toEqual(3)
  })

  it('does not persist the records to the store after index() when "persist" is false', async () => {
    await populateRecords('posts', 3)
    const postsRepo = useRepo(Post)

    const indexer = useIndexResources(Post)
    await indexer.index()

    expect(postsRepo.all().length).toEqual(3)
    expect(postsRepo.query().where('title', 'qui est esse').first())
      .toHaveProperty('body', 'est rerum tempore vitae\nnsequi sint nihil reprehenderit dolor beatae ea dolores neque\nnfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nnqui aperiam non debitis possimus qui neque nisi nulla')
  })

  it('can index resources immediately', async () => {
    await populateRecords('posts', 15)

    const indexer = useIndexResources(Post, { immediate: true })

    await vi.waitUntil(() => {
      return indexer.records.value?.length > 0
    })

    expect(indexer.records.value.length).greaterThan(0)
  })

  it('sets validation errors when the response has validation errors', async () => {
    const postsIndexer = useIndexResources(Post)
    piniaLocalStorageState.mockValidationErrors = {
      'title[0]': ['title must be a string'],
    }

    await postsIndexer.index()

    expect(postsIndexer.validationErrors.value['title[0]'])
      .toEqual(expect.arrayContaining(['title must be a string']))
  })

  it('clears validation errors when a request is made', async () => {
    const postsIndexer = useIndexResources(Post)
    piniaLocalStorageState.mockValidationErrors = {
      'title[0]': ['title must be a string'],
    }
    piniaLocalStorageState.mockLatencyMs = 200

    await postsIndexer.index()

    expect(postsIndexer.validationErrors.value['title[0]'])
      .toEqual(expect.arrayContaining(['title must be a string']))

    postsIndexer.index() // intentionally not awaited
    expect(postsIndexer.validationErrors.value)
      .toEqual({})
  })

  it('sets standard errors when the response has standard errors', async () => {
    const postsIndexer = useIndexResources(Post)
    piniaLocalStorageState.mockStandardErrors = [{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }]

    await postsIndexer.index()

    expect(postsIndexer.standardErrors.value[0])
      .toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })
  })

  it('clears standard errors when a request is made', async () => {
    const postsIndexer = useIndexResources(Post)
    piniaLocalStorageState.mockStandardErrors = [{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }]

    await postsIndexer.index()

    expect(postsIndexer.standardErrors.value[0])
      .toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })

    postsIndexer.index() // intentionally not awaited
    expect(postsIndexer.standardErrors.value)
      .toEqual([])
  })

  it('success and error responses have an "action" of "index"', async () => {
    const postsIndexer = useIndexResources(Post)
    piniaLocalStorageState.mockStandardErrors = [{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }]

    await postsIndexer.index()

    expect(postsIndexer.response.value.action)
      .toEqual('index')

    piniaLocalStorageState.mockStandardErrors = []
    await postsIndexer.index()

    expect(postsIndexer.response.value.action)
      .toEqual('index')
  })

  it('contains included data in "indexer.record.value"', async () => {
    await populateRecords('users', 2)
    await populateRecords('posts', 15)
    await populateRecords('comments', 63)

    const postIndexer = useIndexResources(User, {
      includes: { posts: { comments: {} } },
    })
    await postIndexer.index()

    expect(postIndexer.records.value[1].posts[2].comments.length).toBe(3)
  })

  it('exposes "makeQuery" so dev can make their own query', async () => {
    await populateRecords('users', 2)
    await populateRecords('posts', 20)
    await populateRecords('comments', 80)

    const usersIndexer = useIndexResources(User)
    await usersIndexer.index()

    const postIndexer = useIndexResources(Post, {
      includes: { comments: {} },
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

    const usersIndexer = useIndexResources(User, {
      includes: {
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

    const usersIndexer = useIndexResources(User, {
      includes: {
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

  it('can sort nested records and get a sorted response', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 1)
    await populateRecords('comments', 3)

    const usersIndexer = useIndexResources(User, {
      includes: {
        posts: {
          comments: {
            _sortBy: [{ field: 'name', direction: 'descending' }],
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

  it('can sort nested records get sorted records', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 1)
    await populateRecords('comments', 3)

    const usersIndexer = useIndexResources(User, {
      includes: {
        posts: {
          comments: {
            _sortBy: [{ field: 'name', direction: 'descending' }],
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

    const indexer = useIndexResources(Post, { pagination: { recordsPerPage: 3 } })
    await indexer.index()

    expect(indexer.records.value.length).toEqual(3)
  })

  it('can paginate via indexer.next()', async () => {
    await populateRecords('posts', 9)

    const indexer = useIndexResources(Post, { pagination: { recordsPerPage: 3 } })
    await indexer.index()

    expect(indexer.records.value.length).toEqual(3)
    expect(indexer.records.value[1].title).toEqual('qui est esse')

    await indexer.next()
    expect(indexer.records.value.length).toEqual(3)
    expect(indexer.records.value[1].title).toEqual('nesciunt quas odio')
  })

  it('can paginate via indexer.previous()', async () => {
    await populateRecords('posts', 9)

    const indexer = useIndexResources(Post, { pagination: { recordsPerPage: 3 } })
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

    const indexer = useIndexResources(Post, { pagination: { recordsPerPage: 3 } })

    await indexer.next()
    expect(indexer.records.value.length).toEqual(3)
    expect(indexer.records.value[1].title).toEqual('qui est esse')
  })

  it('indexes the first page when using "indexer.previous()", if there is no pagination data', async () => {
    await populateRecords('posts', 9)

    const indexer = useIndexResources(Post, { pagination: { recordsPerPage: 3 } })

    await indexer.previous()
    expect(indexer.records.value.length).toEqual(3)
    expect(indexer.records.value[1].title).toEqual('qui est esse')
  })

  it('throws an error when calling "indexer.next()" when "recordsPerPage" is not set', async () => {
    await populateRecords('posts', 3)
    const indexer = useIndexResources(Post)

    expect(() => indexer.next()).rejects.toThrowError('recordsPerPage')
  })

  it('throws an error when calling "indexer.previous()" when "recordsPerPage" is not set', async () => {
    await populateRecords('posts', 3)
    const indexer = useIndexResources(Post)

    expect(() => indexer.previous()).rejects.toThrowError('recordsPerPage')
  })

  it('can navigate directly to a page via indexer.toPage()', async () => {
    await populateRecords('posts', 9)

    const indexer = useIndexResources(Post, { pagination: { recordsPerPage: 3 } })

    await indexer.toPage(3)
    expect(indexer.records.value.length).toEqual(3)
    expect(indexer.records.value[0].title).toEqual('magnam facilis autem')
  })

  it('throws an error when calling "indexer.toPage()" when "recordsPerPage" is not set', async () => {
    await populateRecords('posts', 3)
    const indexer = useIndexResources(Post)

    expect(() => indexer.toPage(1)).rejects.toThrowError('recordsPerPage')
  })

  it('can navigate directly to the first page via indexer.toFirstPage()', async () => {
    await populateRecords('posts', 6)
    const indexer = useIndexResources(Post, { pagination: { recordsPerPage: 2 } })

    await indexer.next()
    await indexer.next()
    await indexer.toFirstPage()

    expect(indexer.records.value.length).toEqual(2)
    expect(indexer.records.value[1].title).toEqual('qui est esse')
  })

  it('throws an error when calling "indexer.toFirstPage()" when "recordsPerPage" is not set', async () => {
    await populateRecords('posts', 3)
    const indexer = useIndexResources(Post)

    expect(() => indexer.toFirstPage()).rejects.toThrowError('recordsPerPage')
  })

  it('can navigate directly to the last page via indexer.toLastPage()', async () => {
    await populateRecords('posts', 6)
    const indexer = useIndexResources(Post, { pagination: { recordsPerPage: 2 } })

    await indexer.toLastPage()

    expect(indexer.records.value.length).toEqual(2)
    expect(indexer.records.value[0].title).toEqual('nesciunt quas odio')
  })

  it('throws an error when calling "indexer.toLastPage()" when "recordsPerPage" is not set', async () => {
    await populateRecords('posts', 3)
    const indexer = useIndexResources(Post)

    expect(() => indexer.toLastPage()).rejects.toThrowError('recordsPerPage')
  })

  it('can paginate immediately when "pagination.value.currentPage" changes', async () => {
    await populateRecords('posts', 9)

    const indexer = useIndexResources(Post, {
      immediatelyPaginate: true,
      pagination: { recordsPerPage: 3 },
    })

    await indexer.index()
    indexer.pagination.value.currentPage = 3
    await nextTick()
    await vi.waitUntil(() => !indexer.indexing.value)

    expect(indexer.records.value[0].title).toEqual('magnam facilis autem')
  })

  it('can paginate immediately when "pagination.value.recordsPerPage" changes', async () => {
    await populateRecords('posts', 10)

    const indexer = useIndexResources(Post, {
      immediatelyPaginate: true,
      pagination: { recordsPerPage: 2 },
    })

    await indexer.index()
    indexer.pagination.value.recordsPerPage = 5
    indexer.pagination.value.currentPage = 2
    await nextTick()
    await vi.waitUntil(() => !indexer.indexing.value)

    expect(indexer.records.value[2].title).toEqual('dolorem dolore est ipsam')
  })

  it('has a first preference for "index({ recordsPerPage })"', async () => {
    await populateRecords('posts', 10)
    vueModelState.config.pagination = { recordsPerPage: 2 }
    vueModelState.drivers.local.config.pagination = { recordsPerPage: 3 }

    const indexer = useIndexResources(Post, {
      pagination: { recordsPerPage: 4 },
    })

    await indexer.index({ recordsPerPage: 5 })

    expect(indexer.records.value.length).toEqual(5)
  })

  it('has a seconds preference for "options.pagination.value.recordsPerPage"', async () => {
    await populateRecords('posts', 10)
    vueModelState.config.pagination = { recordsPerPage: 2 }
    vueModelState.drivers.local.config.pagination = { recordsPerPage: 3 }

    const indexer = useIndexResources(Post, {
      pagination: { recordsPerPage: 4 },
    })

    await indexer.index()

    expect(indexer.records.value.length).toEqual(4)
  })

  it('has a third preference for "config.driver.config.pagination.recordsPerPage"', async () => {
    await populateRecords('posts', 10)
    vueModelState.config.pagination = { recordsPerPage: 2 }
    vueModelState.drivers.local.config.pagination = { recordsPerPage: 3 }

    const indexer = useIndexResources(Post)

    await indexer.index()

    expect(indexer.records.value.length).toEqual(3)
  })

  it('has a fourth preference for "config.pagination.recordsPerPage"', async () => {
    await populateRecords('posts', 10)
    vueModelState.config.pagination = { recordsPerPage: 2 }

    const indexer = useIndexResources(Post)

    await indexer.index()

    expect(indexer.records.value.length).toEqual(2)
  })

  it('refreshes the current page when "index()" is called', async () => {
    await populateRecords('posts', 4)

    const indexer = useIndexResources(Post, { pagination: { recordsPerPage: 2 } })

    await indexer.index()

    expect(indexer.records.value[1].title).toEqual('qui est esse')
    await indexer.index()
    // Consider testing writing a test similar to this for your implementation
    // and change the record below on the backend.
    expect(indexer.records.value[1].title).toEqual('qui est esse')
  })

  it('has an "indexer.isLastPage.value" of true when on the last page and false when not on the last page', async () => {
    await populateRecords('posts', 4)

    const indexer = useIndexResources(Post, { pagination: { recordsPerPage: 2 } })

    await indexer.index()

    expect(indexer.isLastPage.value).toEqual(false)
    await indexer.next()
    expect(indexer.isLastPage.value).toEqual(true)
  })

  it('has an "indexer.isFirstPage.value" of true when on the first page and false when not on the first page', async () => {
    await populateRecords('posts', 4)

    const indexer = useIndexResources(Post, { pagination: { recordsPerPage: 2 } })

    await indexer.index()

    expect(indexer.isFirstPage.value).toEqual(true)
    await indexer.next()
    expect(indexer.isFirstPage.value).toEqual(false)
  })

  it('sets a standard error when trying to navigate after the last page', async () => {
    await populateRecords('posts', 4)

    const indexer = useIndexResources(Post, { pagination: { recordsPerPage: 2 } })

    await indexer.index()

    await indexer.next()
    await indexer.next()

    expect(indexer.standardErrors.value[0].message).toContain('last')
  })

  it('sets a standard error when trying to navigate before the first page', async () => {
    await populateRecords('posts', 2)

    const indexer = useIndexResources(Post, { pagination: { recordsPerPage: 2 } })

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

    const usersIndexer = useIndexResources(User, {
      scopes: { defaultTenant: {} },
    })
    await usersIndexer.index()

    expect(usersIndexer.records.value.length).toEqual(4)
  })

  it('can sort in a scope', async () => {
    await populateRecords('users', 10)
    vueModelState.config.scopes = {
      sortByName: {
        sortBy: [
          { field: 'username', direction: 'ascending' },
        ],
      },
    }

    const usersIndexer = useIndexResources(User, {
      scopes: { sortByName: {} },
    })
    await usersIndexer.index()

    expect(usersIndexer.records.value[0].username).toEqual('Antonette')
  })

  it('can include in a scope', async () => {
    await populateRecords('users', 1)
    await populateRecords('posts', 1)
    await populateRecords('comments', 6)
    vueModelState.config.scopes = {
      withPosts: {
        includes: {
          posts: { comments: {} },
        },
      },
    }

    const usersIndexer = useIndexResources(User, {
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

    const usersIndexer = useIndexResources(User, {
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

    const usersIndexer = useIndexResources(User, {
      scopes: [{ name: 'whereTenantId', paramaters: { tenantId: '1' } }],
    })
    await usersIndexer.index()

    expect(usersIndexer.records.value.length).toEqual(2)
  })

  it('can pass a ref to "useIndex({ scopes })"', async () => {
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
    const usersIndexer = useIndexResources(User, {
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

    const usersIndexer = useIndexResources(User, {
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

    const usersIndexer = useIndexResources(User, {
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

    const usersIndexer = useIndexResources(User, {
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

    const usersIndexer = useIndexResources(User)
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

    const usersIndexer = useIndexResources(User)
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

    const usersIndexer = useIndexResources(User)
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

    const usersIndexer = useIndexResources(User)
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

    const usersIndexer = useIndexResources(User, { withoutGlobalScopes: ['defaultTenant'] })
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

    const usersIndexer = useIndexResources(User, { withoutEntityGlobalScopes: ['defaultTenant'] })
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

    const usersIndexer = useIndexResources(User)
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

    const usersIndexer = useIndexResources(User, { includes: { posts: {} } })
    await usersIndexer.index()

    expect(usersIndexer.records.value[0].posts.length).toEqual(2)
  })
})
