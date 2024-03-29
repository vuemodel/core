<script setup lang="ts">
import UseIndexerImmediateRaw from './examples/use-indexer/UseIndexerImmediate.vue?raw'
import UseIndexerImmediate from './examples/use-indexer/UseIndexerImmediate.vue'

import UseIndexerMakeQueryRaw from './examples/use-indexer/UseIndexerMakeQuery.vue?raw'
import UseIndexerMakeQuery from './examples/use-indexer/UseIndexerMakeQuery.vue'

import UseIndexerAndOrFiltersRaw from './examples/use-indexer/UseIndexerAndOrFilters.vue?raw'
import UseIndexerAndOrFilters from './examples/use-indexer/UseIndexerAndOrFilters.vue'

import UseIndexerBasicRaw from './examples/use-indexer/UseIndexerBasic.vue?raw'
import UseIndexerBasic from './examples/use-indexer/UseIndexerBasic.vue'

import UseIndexerPersistByRaw from './examples/use-indexer/UseIndexerPersistBy.vue?raw'
import UseIndexerPersistBy from './examples/use-indexer/UseIndexerPersistBy.vue'

import UseIndexerBasicWithRaw from './examples/use-indexer/UseIndexerBasicWith.vue?raw'
import UseIndexerBasicWith from './examples/use-indexer/UseIndexerBasicWith.vue'

import UseIndexerWithNestedRaw from './examples/use-indexer/UseIndexerWithNested.vue?raw'
import UseIndexerWithNested from './examples/use-indexer/UseIndexerWithNested.vue'

import UseIndexerEntityScopesRaw from './examples/use-indexer/UseIndexerEntityScopes.vue?raw'
import UseIndexerEntityScopes from './examples/use-indexer/UseIndexerEntityScopes.vue'

import UseIndexerFiltersRaw from './examples/use-indexer/UseIndexerFilters.vue?raw'
import UseIndexerFilters from './examples/use-indexer/UseIndexerFilters.vue'

import UseIndexerFiltersSearchRaw from './examples/use-indexer/UseIndexerFiltersSearch.vue?raw'
import UseIndexerFiltersSearch from './examples/use-indexer/UseIndexerFiltersSearch.vue'

import UseIndexerIndexingRaw from './examples/use-indexer/UseIndexerIndexing.vue?raw'
import UseIndexerIndexing from './examples/use-indexer/UseIndexerIndexing.vue'

import UseIndexerNestedFiltersRaw from './examples/use-indexer/UseIndexerNestedFilters.vue?raw'
import UseIndexerNestedFilters from './examples/use-indexer/UseIndexerNestedFilters.vue'

import UseIndexerNestedWithRaw from './examples/use-indexer/UseIndexerNestedWith.vue?raw'
import UseIndexerNestedWith from './examples/use-indexer/UseIndexerNestedWith.vue'

import UseIndexerNestedWithAndOrRaw from './examples/use-indexer/UseIndexerNestedWithAndOr.vue?raw'
import UseIndexerNestedWithAndOr from './examples/use-indexer/UseIndexerNestedWithAndOr.vue'

import UseIndexerOrderByRaw from './examples/use-indexer/UseIndexerOrderBy.vue?raw'
import UseIndexerOrderBy from './examples/use-indexer/UseIndexerOrderBy.vue'

import UseIndexerPaginationRaw from './examples/use-indexer/UseIndexerPagination.vue?raw'
import UseIndexerPagination from './examples/use-indexer/UseIndexerPagination.vue'

import UseIndexerPaginationImmediateRaw from './examples/use-indexer/UseIndexerPaginationImmediate.vue?raw'
import UseIndexerPaginationImmediate from './examples/use-indexer/UseIndexerPaginationImmediate.vue'

import UseIndexerScopesRaw from './examples/use-indexer/UseIndexerScopes.vue?raw'
import UseIndexerScopes from './examples/use-indexer/UseIndexerScopes.vue'

import UseIndexerWhereIdInRaw from './examples/use-indexer/UseIndexerWhereIdIn.vue?raw'
import UseIndexerWhereIdIn from './examples/use-indexer/UseIndexerWhereIdIn.vue'

</script>

# `useIndexer` Composable
```ts
import { useIndexer } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'

const postsIndexer = useIndexer(Post)
await postsIndexer.index()
console.log(postsIndexer.records.value)
```

[[toc]]

`useIndexer` helps you **"filter"**, **"order"**, **"paginate"** and include (**"with"**) records. Here's a basic example:

<ExamplePanel
  title="Basic Indexer"
  :content="UseIndexerBasicRaw"
  :exampleComponent="UseIndexerBasic"
/>

## `records` and `request`
When accessing `indexer.records.value`, we're **pulling it out of the store**. This is good news! It means any changes to the record in other parts of our application will be reflected when using `indexer.records.value`.

You can also access records via `indexer.request.value.records`. These records **are not pulled from the store** and therefore, are not reactive. For example, if you later destroy a record with `useDestroyer`, that action **will not** be reflected in `indexer.request.value.records`.

## `makeQuery`
```ts
const usersIndexer = useIndexer(User)

const usersPopulated = computed(() => {
  return usersIndexer.makeQuery()
    .with('posts', query => query.with('comments'))
    .get()
})
```

In this part of the docs, "store query" means "a query for data on the frontend".

One of the cool things about VueModel, is that the query you use to get data from the backend, is the same query used to get data on the frontend (store query). Therefore, if you fetch users with posts and comments (`users.posts.comments`) the store query to fetch that data is built for you automatically (`indexer.records`)!

If you want to change this store query, you can use `makeQuery()`. `makeQuery()` builds a query with all your filters, includes, orderBys etc. This gives you more control over the store query, because now you can continue to add to this query!

In the following example:
- all users are fetched
- all posts are fetched
- all comments are fetched
- we use `makeQuery()` on the user to "stitch" all this data together

<ExamplePanel
  title="Make Query"
  :content="UseIndexerMakeQueryRaw"
  :exampleComponent="UseIndexerMakeQuery"
/>

Isn't [PiniaORM](https://pinia-orm.codedredd.de/) wonderful? We couldn't have built VueModel without it 💚.

::: info
Take a look at PiniaORM's ["Retrieving Data" docs](https://pinia-orm.codedredd.de/api/query/all) to see other ways you can query data in the store. Or for more advanced users, jump straight to the ["Query API"](https://pinia-orm.codedredd.de/api/query/all).
:::

## `immediate`
```ts
const postsIndexer = useIndexer(Post, { immediate: true })
```

Calls `index()` when the composable has initialized.

<ExamplePanel
  title="Immediate"
  :content="UseIndexerImmediateRaw"
  :exampleComponent="UseIndexerImmediate"
/>

## Filters

### Available Filters

Currently, VueModel supports the following filters:
- equals
- doesNotEqual
- lessThan
- lessThanOrEqual
- greaterThan
- greaterThanOrEqual
- in
- notIn
- contains
- doesNotContain
- between
- startsWith
- endsWith

::: warning
The driver you're using might not support all the above filters.
:::

### Usage
```ts
const postsIndexer = useIndexer(Post, {
  filters: {
    name: { equals: 'Chelsey Dietrich' },
  }
})
```

This example demonstrates a basic `equals` filter to narrow the records to one user ("Chelsey Dietrich"):
<ExamplePanel
  title="Basic Filters (equals)"
  :content="UseIndexerFiltersRaw"
  :exampleComponent="UseIndexerFilters"
/>

This example uses "contains", and [`watchDebounced`](https://vueuse.org/shared/watchDebounced/#watchdebounced) from [VueUse](https://vueuse.org/), for debounced search functionality:
<ExamplePanel
  title="Basic Filters (contains)"
  :content="UseIndexerFiltersSearchRaw"
  :exampleComponent="UseIndexerFiltersSearch"
/>

### And/Or Blocks

We can narrow our filters by using and/or blocks:
```ts
{
  body: {
    contains: 'est',
  },
  or: [
    {
      created_at: {
        greaterThan: '2023-08-02',
      },
    },
    {
      user_id: {
        equals: '1',
      },
    },
  ]
}
```

<ExamplePanel
  title="And Or Blocks"
  :content="UseIndexerAndOrFiltersRaw"
  :exampleComponent="UseIndexerAndOrFilters"
/>

### Filtering Nested Data
Of course, we also have nested filters! Let's find users that have posted since `2023-11-11`
```ts
const usersIndexer = useIndexer(User, {
  filters: {
    posts: {
      created_at: {
        greaterThan: '2023-11-11',
      },
    },
  },
})
```

<ExamplePanel
  title="Nested Filters"
  :content="UseIndexerNestedFiltersRaw"
  :exampleComponent="UseIndexerNestedFilters"
/>

## `with` (including related data)
There are three notations we can use to include data:
- object (recommended)
- string
- string array

::: code-group
```ts [object (recommended)]
const postsIndexer = useIndexer(Post, {
  with: { user: {} }
})
```

```ts [string]
const postsIndexer = useIndexer(Post, { with: 'user' })
```

```ts [string[]]
const postsIndexer = useIndexer(Post, { with: ['user', 'comments'] })
```
:::

For more complex apps, we recommend sticking to object notation (the first example above). It provides better type completion, and allows you to add useful features like `orderBy`'s and `filter`'s when they're needed.

<ExamplePanel
  title="Basic 'With'"
  :content="UseIndexerBasicWithRaw"
  :exampleComponent="UseIndexerBasicWith"
/>

::: info
`_limit` is also available when working with nested data.
:::

### Deeply nested `with`
Of course, we can also include nested data using either object notation, or dot notation:

::: code-group
```ts [object (recommended)]
const usersIndexer = useIndexer(User, {
  with: { post: { comments: {} } }
})
```

```ts [string]
const usersIndexer = useIndexer(User, { with: 'posts.comments' })
```

```ts [string[]]
const usersIndexer = useIndexer(User, { with: ['posts.comments'] })
```
:::

<ExamplePanel
  title="Deeply Nested 'With'"
  :content="UseIndexerWithNestedRaw"
  :exampleComponent="UseIndexerWithNested"
/>

### Filtering Nested Data (`with`)
While including nested data, we can apply filters!
```ts
const postsIndexer = useIndexer(Post, {
  with: {
    user: { name: { equals: 'Clementine Bauch' } }
  }
})
```

<ExamplePanel
  title="Nested Filters (with)"
  :content="UseIndexerNestedWithRaw"
  :exampleComponent="UseIndexerNestedWith"
/>

and/or blocks allow us to further narrow our result.
```ts
const postsIndexer = useIndexer(Post, {
  with: {
    posts: {
      or: [
        {
          created_at: { greaterThan: '2023-09-01' },
          title: { equals: 'qui est esse' },
        },
      ],
    },
  },
})
```

<ExamplePanel
  title="Or Operator (with)"
  :content="UseIndexerNestedWithAndOrRaw"
  :exampleComponent="UseIndexerNestedWithAndOr"
/>

## `indexing`
Add a spinner with `indexing.value`:
```html
<q-btn
  label="Index"
  @click="postsIndexer.index()"
  :loading="postsIndexer.indexing.value"
/>
```

<ExamplePanel
  title="Spinner"
  :content="UseIndexerIndexingRaw"
  :exampleComponent="UseIndexerIndexing"
/>

## `orderBy`
```ts
const postsIndexer = useIndexer(Post, {
  orderBy: [
    { field: 'created_at', direction: 'descending' }
  ]
})
```

<ExamplePanel
  title="Order By"
  :content="UseIndexerOrderByRaw"
  :exampleComponent="UseIndexerOrderBy"
/>

## Pagination
```ts
const postsIndexer = useIndexer(Post, { pagination: { recordsPerPage: 3 } })
```
Pagination with VueModel is easy!
1. Set `recordsPerPage`
2. Call `next()`, `previous()` or `toPage(pageNumber)` to paginate!

Here's the full pagination API:

**options.pagination**
- `page`
- `recordsPerPage`

**Pagination**
- `indexer.pagination.value.recordsCount`
- `indexer.pagination.value.pagesCount`
- `indexer.toFirstPage()`
- `indexer.toLastPage()`
- `indexer.isFirstPage.value`
- `indexer.isLastPage.value`

<ExamplePanel
  title="Pagination"
  :content="UseIndexerPaginationRaw"
  :exampleComponent="UseIndexerPagination"
/>

### Paginate Immediately
```ts
const postsIndexer = useIndexer(Post, {
  pagination: { recordsPerPage: 3 },
  paginateImmediate: true,
})
```

`paginateImmediate` will trigger `index()` when:
- `pagination.value.recordsPerPage` changes
- `pagination.value.page` changes

Put simply, it means we don't have to call `index()` manually when we're ready to change pages.

<ExamplePanel
  title="Immediate Pagination"
  :content="UseIndexerPaginationImmediateRaw"
  :exampleComponent="UseIndexerPaginationImmediate"
/>

## `persist`
```ts
const postsIndexer = useIndexer(Post, { persist: false })
```
After indexing data, it's automatically persisted to the store. To prevent this, we can set `persist: false`.

## `persistBy`
```ts
const postsIndexer = useIndexer(Post, { persistBy: 'insert' })
```
There are four different strategies we can use when persisting data to the store:
1. [save](https://pinia-orm.codedredd.de/guide/repository/inserting-data#inserting-data-1) (default): save records **and related records** to the store
2. [insert](https://pinia-orm.codedredd.de/guide/repository/inserting-data#inserting-data-without-normalization): save records **without related records** to the store. We might think of this as a "flat save"
3. replace-save: flush all data from the store, then **save**
4. replace-insert: flush all data from the store, then **insert**
After indexing data, it's automatically persisted to the store. To prevent this, we can set `persist: false`


<ExamplePanel
  title="Persist By"
  :content="UseIndexerPersistByRaw"
  :exampleComponent="UseIndexerPersistBy"
/>

## Indexing By ID (`whereIdIn`)
```ts
const postsIndexer = useIndexer(Post, {
  pagination: { recordsPerPage: 3 },
  paginateImmediate: true,
})
```

Sometimes, we already know what `id`'s we need to search for. For that, we have `whereIdIn`.

This is especially handy when working with composite keys. `whereIdIn` is responsible for converting composite keys into a request the backend can understand.

<ExamplePanel
  title="Indexing By Ids"
  :content="UseIndexerWhereIdInRaw"
  :exampleComponent="UseIndexerWhereIdIn"
/>

## Scopes
::: code-group
```ts [global]
import { vueModelState, useIndexer } from '@vuemodel/core'
import { Post } from 'sample-data'

vueModelState.config.scopes = {
  latest: {
    orderBy: [
      { field: 'created_at', direction: 'descending' }
    ]
  },
}
```

```ts [driver]
import { vueModelState } from '@vuemodel/core'

vueModelState.driver.local.config.scopes = {
  latest: {
    orderBy: [
      { field: 'created_at', direction: 'descending' }
    ]
  },
}
```
:::

Usage
```ts
import { Post } from 'sample-data'
import { useIndexer } from '@vuemodel/core'

const postsIndexer = useIndexer(Post, { scopes: ['latest'] })
```

Applying globally
::: code-group
```ts [global]
import { vueModelState } from '@vuemodel/core'

vueModelState.config.scopes = {
  tenant: {
    filters: { tenant_id: { equals: '1' } },
  },
  globallyAppliedScopes: ['tenant']
}
```

```ts [driver]
import { vueModelState } from '@vuemodel/core'

vueModelState.driver.local.config.scopes = {
  tenant: {
    filters: { tenant_id: { equals: '1' } },
  },
  globallyAppliedScopes: ['tenant']
}
```
:::


::: warning
The use of a `tenant_id` in the example above can be great for testing using the local driver, yet is not a secure way to filter by tenant in production.
:::

Scopes allow you to predefine filters. For example, if all our records have a `created_at` field, you may want to make a `latest` scope.

<ExamplePanel
  title="Scopes"
  :content="UseIndexerScopesRaw"
  :exampleComponent="UseIndexerScopes"
/>

### Disabling Global Scopes
We can disable global scopes with the `withoutGlobalScopes` option:

```ts
const postsIndexer = useIndexer(Post, {
  withoutGlobalScopes: ['defaultTenant']
})
```

## Entity Scopes
Entity scopes are almost identical to scopes. The difference, is that they're **only for a specific model**.

For example, if you want a scope that only applies to a **User** model, then you want an entity scope.

```ts
vueModelState.config.entityScopes = {
  users: { // only applied to users
    orgWebsite: {
      filters: { website: { endsWith: '.org' } },
    },
  },
}
```

<ExamplePanel
  title="Entity Scopes"
  :content="UseIndexerEntityScopesRaw"
  :exampleComponent="UseIndexerEntityScopes"
/>

### Disabling Global Entity Scopes
We can disable global entity scopes with the `withoutEntityGlobalScopes` option:

```ts
const postsIndexer = useIndexer(Post, {
  withoutEntityGlobalScopes: ['orgWebsite']
})
```