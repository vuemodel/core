<script setup>
import IndexBasicRaw from './examples/IndexBasic.vue?raw'
import IndexBasic from './examples/IndexBasic.vue'

import IndexWithsRaw from './examples/IndexWiths.vue?raw'
import IndexWiths from './examples/IndexWiths.vue'

import IndexNestedRaw from './examples/IndexNested.vue?raw'
import IndexNested from './examples/IndexNested.vue'

import IndexFilterWithsRaw from './examples/IndexFilterWiths.vue?raw'
import IndexFilterWiths from './examples/IndexFilterWiths.vue'

import IndexAndOrWithRaw from './examples/IndexAndOrWith.vue?raw'
import IndexAndOrWith from './examples/IndexAndOrWith.vue'

import IndexPaginationRaw from './examples/IndexPagination.vue?raw'
import IndexPagination from './examples/IndexPagination.vue'

import IndexOrderByRaw from './examples/IndexOrderBy.vue?raw'
import IndexOrderBy from './examples/IndexOrderBy.vue'

import IndexOrderByNestedRaw from './examples/IndexOrderByNested.vue?raw'
import IndexOrderByNested from './examples/IndexOrderByNested.vue'
</script>

# Index Resources

When indexing a resource, you'll likely want [`useIndex()`](../composables/02-use-indexer.md). However at times we can't use the composition api. For that, we have `index()`.

::: warning
Some backends do not support all the features on this page
:::

<ExamplePanel
  title="Basic Usage"
  :content="IndexBasicRaw"
  :exampleComponent="IndexBasic"
/>

## With (Including data)
Also known as **expand**, **include** and **populate** (comes in many names depending on your backend). We can fetch related data and apply filters using `with`.

<ExamplePanel
  title="Related Data (With)"
  :content="IndexWithsRaw"
  :exampleComponent="IndexWiths"
/>

<ExamplePanel
  title="Deeply Nested Data (With)"
  :content="IndexNestedRaw"
  :exampleComponent="IndexNested"
/>

### Filtering Included Data
Advanced filters are possible via VueModel's query object. The query object is inspired by [Strapi](https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication#filtering), and [Orion (Laravel)](https://tailflow.github.io/laravel-orion-docs/v2.x/guide/search.html#search)

Querying nested data has been meticulously typed. Consider using `ctrl + space` as you write the query to see what filters, fields and relationships you have available:

```ts
const response = await index(User, {
  with: {
    posts: {
      title: {
        contains: 'est',
      },
    },
  },
})
```

<ExamplePanel
  title="Filtering Included Data"
  :content="IndexFilterWithsRaw"
  :exampleComponent="IndexFilterWiths"
/>

## Filtering (And/Or Blocks)
We can even filter using an `or` block! `and` blocks are also supported.

<ExamplePanel
  title="Filtering (And/Or Blocks)"
  :content="IndexAndOrWithRaw"
  :exampleComponent="IndexAndOrWith"
/>


```js
index(User, {
    includes: {
      posts: {
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
        ],
      },
    },
  })
```

In the above example:
- every post must have a `body` that contains `'est'`
- the post must also be created after `'2023-08-02'` **OR** have a `user_id` of `'1'`

## Order By
Of course, we can order our results.

<ExamplePanel
  title="Order By"
  :content="IndexOrderByRaw"
  :exampleComponent="IndexOrderBy"
/>

## Nested Order By
And order nested records at any level!

<ExamplePanel
  title="Nested Order By"
  :content="IndexOrderByNestedRaw"
  :exampleComponent="IndexOrderByNested"
/>

## Pagination
Of course, we can also paginate the results.

<ExamplePanel
  title="Filtering With Data (Pagination)"
  :content="IndexPaginationRaw"
  :exampleComponent="IndexPagination"
/>