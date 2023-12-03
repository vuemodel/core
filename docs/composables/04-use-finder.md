<script setup>
import UseFinderBasicRaw from './examples/use-finder/UseFinderBasic.vue?raw'
import UseFinderBasic from './examples/use-finder/UseFinderBasic.vue'

import UseFinderFindingRaw from './examples/use-finder/UseFinderFinding.vue?raw'
import UseFinderFinding from './examples/use-finder/UseFinderFinding.vue'

import UseFinderFindingRefreshRaw from './examples/use-finder/UseFinderFindingRefresh.vue?raw'
import UseFinderFindingRefresh from './examples/use-finder/UseFinderFindingRefresh.vue'

import UseFinderImmediateRaw from './examples/use-finder/UseFinderImmediate.vue?raw'
import UseFinderImmediate from './examples/use-finder/UseFinderImmediate.vue'

import UseFinderMakeQueryRaw from './examples/use-finder/UseFinderMakeQuery.vue?raw'
import UseFinderMakeQuery from './examples/use-finder/UseFinderMakeQuery.vue'

import UseFinderPersistByRaw from './examples/use-finder/UseFinderPersistBy.vue?raw'
import UseFinderPersistBy from './examples/use-finder/UseFinderPersistBy.vue'

import UseFinderRecordAndResponseRaw from './examples/use-finder/UseFinderRecordAndResponse.vue?raw'
import UseFinderRecordAndResponse from './examples/use-finder/UseFinderRecordAndResponse.vue'

import UseFinderWithRaw from './examples/use-finder/UseFinderWith.vue?raw'
import UseFinderWith from './examples/use-finder/UseFinderWith.vue'

import UseFinderWithNestedRaw from './examples/use-finder/UseFinderWithNested.vue?raw'
import UseFinderWithNested from './examples/use-finder/UseFinderWithNested.vue'

import UseFinderWithAndOrFiltersRaw from './examples/use-finder/UseFinderWithAndOrFilters.vue?raw'
import UseFinderWithAndOrFilters from './examples/use-finder/UseFinderWithAndOrFilters.vue'

import UseFinderWithFiltersRaw from './examples/use-finder/UseFinderWithFilters.vue?raw'
import UseFinderWithFilters from './examples/use-finder/UseFinderWithFilters.vue'

import UseFinderWithNestedFiltersRaw from './examples/use-finder/UseFinderWithNestedFilters.vue?raw'
import UseFinderWithNestedFilters from './examples/use-finder/UseFinderWithNestedFilters.vue'

import UseFinderWithOrderByRaw from './examples/use-finder/UseFinderWithOrderBy.vue?raw'
import UseFinderWithOrderBy from './examples/use-finder/UseFinderWithOrderBy.vue'
</script>

# `useFinder` Composable
```ts
import { useFinder } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'

const postId = ref('3')
const postFinder = useFinder(Post, { id: postId })
postFinder.find()
```

[[toc]]

## The ID
Usually when using `find`, you'll want the `id` to be dynamic. Like most properties in VueModel, `id` is a `MaybeRefOrGetter`.

This means we have three ways to pass `id` to the options object.
1. static
2. ref
3. getter function (handy when id comes from a prop)

::: code-group
```ts [static]
const postId = '3'
const postFinder = useFinder(Post, { id: postId })
```

```ts [ref]
const postId = ref('3')
const postFinder = useFinder(Post, { id: postId })
```

```ts [ref (computed)]
const props = defineProps<{
  postId: string
}>()

const postId = computed(() => props.postId)
const postFinder = useFinder(Post, { id: postId })
```

```ts [getter function]
const props = defineProps<{
  postId: string
}>()

const postFinder = useFinder(Post, {
    id: () => props.postId
})
```
:::

That last example (getter function) is particularly useful! Often, you'll have a route like the following.
```ts
[
  {
    path: '/user/:postId',
    component: PostPage,
    props: true
  }
]
```

In PostPage, we can easily take that postId, and use it with our finder:
```vue
<script setup lang="ts">
const props = defineProps<{
  postId: string
}>()

const postFinder = useFinder(Post, {
    id: () => props.postId,
    immediate: true
})
</script>
```

<ExamplePanel
  title="Basic Find"
  :content="UseFinderBasicRaw"
  :exampleComponent="UseFinderBasic"
/>

<ExamplePanel
  title="Basic Find (immediate)"
  :content="UseFinderImmediateRaw"
  :exampleComponent="UseFinderImmediate"
/>

We can also pass an id directly to `find()`:
```ts
postFinder.find('5')
```

## Triggering `find()`
The obvious way to trigger `find` is on the composable:
```ts
const postId = ref('4')
const postFinder = useFinder(Post, { id: postId })
postFinder.find()
```

However, it's common to add a watcher to the id, and immediately call "find" when the id changes. VueModel can do this for you via the `immediate` option:
```ts
const postId = ref('4')
const postFinder = useFinder(Post, {
  id: postId,
  immediate: true
})
```

In the example above, `postFinder.find()` is called when:
- The composable is setup
- Whenever `postId` changes

### Debouncing and Throttling

You may also add a debouncer. This isn't common, so it's not built into VueModel however, it's easy to implement using [`watchedDebounced` from VueUse](https://vueuse.org/shared/watchDebounced/#watchdebounced).

We've also added a "throttle" example below for good measure!

::: code-group
```ts [debounced]
import { watchDebounced } from '@vueuse/core'

const postId = ref('4')
const postFinder = useFinder(Post, { id: postId })

watchDebounced(
  postId,
  () => postFinder.find(),
  { debounce: 500, immediate: true },
)
```

```ts [throttled]
import { watchThrottled } from '@vueuse/core'

const postId = ref('4')
const postFinder = useFinder(Post, { id: postId })

watchThrottled(
  postId,
  () => postFinder.find(),
  { throttle: 500 },
)
```
:::

## `finding`
```ts
const postFinder = useFinder(Post, { id: '1' })
postFinder.find()
console.log(postFinder.finding.value) // '3'
```

<ExamplePanel
  title="'finding'"
  :content="UseFinderFindingRaw"
  :exampleComponent="UseFinderFinding"
/>

`finding` is **not** a boolean, it's the **primary key** of the record being found.

You'll often find yourself in situations where knowing if `finding` is true, isn't enough. For that reason, we decided to make `finding` the **id of the record being found**. 

<ExamplePanel
  title="Using 'finding' ID"
  :content="UseFinderFindingRefreshRaw"
  :exampleComponent="UseFinderFindingRefresh"
/>

## `record`
```ts
const postFinder = useFinder(Post, { id: '1' })
await postFinder.find()
console.log(postFinder.record.value)
```

When accessing `finder.record.value`, we're **pulling it out of the store**. This is good news! It means any changes to the record in other parts of our application will be reflected when using `finder.record.value`.

When accessing record with VueModel, you'll almost always want to use `record` over `response`.

<ExamplePanel
  title="Record/Response"
  :content="UseFinderRecordAndResponseRaw"
  :exampleComponent="UseFinderRecordAndResponse"
/>

## `response`
```ts
const postFinder = useFinder(Post, { id: '1' })
await postFinder.find()
console.log(postFinder.response.value)
```

::: warning
`response.value` **does NOT** return data from the store. Prefer `record.value` if you want a value that's responsive to other changes in your app.
:::

The response object is mostly for covering edge cases (like accessing data that didn't end up in the store). It's unlikely you'll need to use it.

## `with` (including related data)
There are three notations we can use to include data:
- object (recommended)
- string
- string array

::: code-group
```ts [object (recommended)]
const postFinder = useFinder(Post, {
  id: '1',
  with: { user: {} }
})
```

```ts [string]
const postFinder = useFinder(Post, {
  id: '1',
  with: 'user'
})
```

```ts [string[]]
const postFinder = useFinder(Post, {
  id: '1',
  with: ['user', 'comments']
})
```
:::

For more complex apps, we recommend sticking to object notation (the first example above). It provides better type completion, and allows you to add useful features like `orderBy`'s and `filter`'s when they're needed.

### Order By
```ts
const userFinder = useFinder(User, {
  id: '1',
  with: {
    posts: {
      _orderBy: [
        { field: 'created_at', direction: 'descending' },
      ],
    },
  },
})
```

When using `with`, we can order the nested data:
<ExamplePanel
  title="Order By (with)"
  :content="UseFinderWithOrderByRaw"
  :exampleComponent="UseFinderWithOrderBy"
/>

::: info
`_limit` is also available when working with nested data.
:::

### Deeply nested `with`
Of course, we can also include nested data using either object notation, or dot notation:

::: code-group
```ts [object (recommended)]
const userFinder = useFinder(User, {
  id: '1',
  with: { post: { comments: {} } }
})
```

```ts [string]
const userFinder = useFinder(User, {
  id: '1',
  with: 'posts.comments'
})
```

```ts [string[]]
const userFinder = useFinder(User, {
  id: '1',
  with: ['posts.comments']
})
```
:::

<ExamplePanel
  title="Deeply Nested 'With'"
  :content="UseFinderWithNestedRaw"
  :exampleComponent="UseFinderWithNested"
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
const postFinder = useFinder(Post, {
  id: '1',
  with: {
    posts: { title: { contains: 'est' } },
  },
})
```

This example demonstrates a basic `contains` filter. We narrow the included `posts` to where `title` contains the text `est`:
<ExamplePanel
  title="Basic Filters (equals)"
  :content="UseFinderWithFiltersRaw"
  :exampleComponent="UseFinderWithFilters"
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
  :content="UseFinderWithAndOrFiltersRaw"
  :exampleComponent="UseFinderWithAndOrFilters"
/>

### Filtering Nested Data
Of course, we also have nested filters! Let's find users that have posted since `2023-11-11`
```ts
const userFinder = useFinder(User, {
  id: '1',
  with: {
    posts: {
      title: { contains: 'qui est' },
      comments: {
        _orderBy: [{
          field: 'commented_on',
          direction: 'descending',
        }],
      },
    },
  },
})
```

<ExamplePanel
  title="Nested Filters"
  :content="UseFinderWithNestedFiltersRaw"
  :exampleComponent="UseFinderWithNestedFilters"
/>

## `makeQuery`
```ts
const userFinder = useFinder(User)

const usersPopulated = computed(() => {
  return userFinder.makeQuery()
    .with('posts', query => query.with('comments'))
    .first()
})
```

In this part of the docs, "store query" means "a query for data on the frontend".

One of the cool things about VueModel, is that the query you use to get data from the backend, is the same query used to get data on the frontend (store query). Therefore, if you fetch users with posts and comments (`users.posts.comments`) the store query to fetch that data is built for you automatically (`finder.record`)!

If you want to change this store query, you can use `makeQuery()`. `makeQuery()` builds a query with all your filters, includes, orderBys etc. This gives you more control over the store query, because now you can continue to add to this query!

In the following example:
- all users are fetched
- all posts are fetched
- all comments are fetched
- we use `makeQuery()` on the user to "stitch" all this data together

<ExamplePanel
  title="Make Query"
  :content="UseFinderMakeQueryRaw"
  :exampleComponent="UseFinderMakeQuery"
/>

Isn't [PiniaORM](https://pinia-orm.codedredd.de/) wonderful? We couldn't have built VueModel without it 💚.

::: warning
Be sure to call `.first()` to get the result of the query, **not** `.get()`. This is because we only want one record, and the results are already filtered to the "found" id.
:::

::: info
Take a look at PiniaORM's ["Retrieving Data" docs](https://pinia-orm.codedredd.de/api/query/all) to see other ways you can query data in the store. Or for more advanced users, jump straight to the ["Query API"](https://pinia-orm.codedredd.de/api/query/all).
:::

## `persist`
```ts
const postFinder = useFinder(Post, {
  id: '1',
  persist: false
})
```
After indexing data, it's automatically persisted to the store. To prevent this, we can set `persist: false`.

## `persistBy`
```ts
const postsIndexer = useIndexer(Post, { persistBy: 'insert' })
```
There are two different strategies we can use when persisting data to the store:
1. [save](https://pinia-orm.codedredd.de/guide/repository/inserting-data#inserting-data-1) (default): save records **and related records** to the store
2. [insert](https://pinia-orm.codedredd.de/guide/repository/inserting-data#inserting-data-without-normalization): save records **without related records** to the store. We might think of this as a "flat save"

<ExamplePanel
  title="Persist By"
  :content="UseFinderPersistByRaw"
  :exampleComponent="UseFinderPersistBy"
/>
