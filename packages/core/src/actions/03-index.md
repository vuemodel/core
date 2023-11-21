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
Also known as `expand`, `include` and `populate`. We can fetch related data and apply filters.

### Basic With

<ExamplePanel
  title="Including Related Data"
  :content="IndexWithsRaw"
  :exampleComponent="IndexWiths"
/>

<ExamplePanel
  title="Deeply Nested With"
  :content="IndexNestedRaw"
  :exampleComponent="IndexNested"
/>

### Filtering Included Data

```js
index(User, {
  includes: {
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

With an `or` block. `and` blocks are also supported.

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
- every post must have a `body` of `'est'`
- the post must also be created after `'2023-08-02'` **OR** have a `user_id` of `'1'`

<ExamplePanel
  title="Filtering With Data (Or Block)"
  :content="IndexAndOrWithRaw"
  :exampleComponent="IndexAndOrWith"
/>

## Pagination
Of course, we can also paginate the results.

<ExamplePanel
  title="Filtering With Data (Pagination)"
  :content="IndexPaginationRaw"
  :exampleComponent="IndexPagination"
/>