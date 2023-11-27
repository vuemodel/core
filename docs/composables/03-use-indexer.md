<script setup lang="ts">
import UseIndexerImmediateRaw from './examples/use-indexer/UseIndexerImmediate.vue?raw'
import UseIndexerImmediate from './examples/use-indexer/UseIndexerImmediate.vue'

import UseIndexerAndOrFiltersRaw from './examples/use-indexer/UseIndexerAndOrFilters.vue?raw'
import UseIndexerAndOrFilters from './examples/use-indexer/UseIndexerAndOrFilters.vue'

import UseIndexerBasicRaw from './examples/use-indexer/UseIndexerBasic.vue?raw'
import UseIndexerBasic from './examples/use-indexer/UseIndexerBasic.vue'

import UseIndexerBasicWithRaw from './examples/use-indexer/UseIndexerBasicWith.vue?raw'
import UseIndexerBasicWith from './examples/use-indexer/UseIndexerBasicWith.vue'

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

const indexer = useIndexer(Post)
await indexer.index()
console.log(indexer.records.value)
```

`useIndexer` has many features to help you **"filter"**, **"order"**, **"paginate"** and include (**"with"**) records. Let's get started with a basic example. Indexing data:

<ExamplePanel
  title="Basic Indexer"
  :content="UseIndexerBasicRaw"
  :exampleComponent="UseIndexerBasic"
/>

## `records` and `request`
When accessing `indexer.records.value`, we're **pulling it out of the store**. This is good news! It means any changes to the record in other parts of your application will be reflected when using `indexer.records.value`.

You can also access records via `indexer.request.value.records`. These records **are not pulled from the store** and therefore, are not reactive. For example, if you later destroy a record with `useDestroyer`, that action **will not** be reflected in `indexer.request.value.records`.

## `makeQuery`
```ts
const usersIndexer = useIndexer(User)

const usersPopulated = computed(() => {
  return usersIndexer.makeQuery()
    .with('posts.comments')
})
```

In this part of the docs, "store query" means "a query for data on the frontend".

One of the cool things about VueModel, is that the query you use to get data from the backend, is the same query used to get data on the frontend (store query). Therefore, if you fetch users with posts and comments (`users.posts.comments`) the store query to fetch that data is built for you automatically!

If you want to change this store query, you can use `makeQuery()`. `makeQuery()` builds a query with all your filters, includes, orderBys etc. This gives you more control over the store query, because now you can continue to add to this query!

In the following example:
- all users are fetched
- all posts are fetched
- all comments are fetched
- we use `makeQuery()` on the user to "stitch" all this data together



Isn't [PiniaORM](https://pinia-orm.codedredd.de/) wonderful? We couldn't have built PiniaORM without it!

## `immediate`
```ts
const indexer = useIndexer(Post, { immediate: true })
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
const indexer = useIndexer(Post, {
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
const indexer = useIndexer(Post, {
  with: { user: {} }
})
```

```ts [string]
const indexer = useIndexer(Post, { with: 'user' })
```

```ts [string[]]
const indexer = useIndexer(Post, { with: ['user', 'comments'] })
```
:::

For more complex apps, we recommend sticking to object notation (the first example above). It provides better type completion, and can add useful features like `orderBy`'s and `filter`'s when they're needed.

<ExamplePanel
  title="Basic 'With'"
  :content="UseIndexerBasicWithRaw"
  :exampleComponent="UseIndexerBasicWith"
/>

### Filtering Nested Data (`with`)
While including nested data, we can apply filters!
```ts
const indexer = useIndexer(Post, {
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
const indexer = useIndexer(Post, {
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
const postsIndexer = useIndexer(Post, {})
```

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

Scopes allow you to predefine filters. For example, if all your records have a `created_at` field, you may want to make a `latest` scope.

<ExamplePanel
  title="Scopes"
  :content="UseIndexerScopesRaw"
  :exampleComponent="UseIndexerScopes"
/>

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















