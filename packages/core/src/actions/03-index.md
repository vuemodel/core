<script setup>
import IndexResourcesBasicRaw from './examples/IndexResourcesBasic.vue?raw'
import IndexResourcesBasic from './examples/IndexResourcesBasic.vue'

import IndexResourcesIncludesRaw from './examples/IndexResourcesIncludes.vue?raw'
import IndexResourcesIncludes from './examples/IndexResourcesIncludes.vue'

import IndexResourcesNestedIncludesRaw from './examples/IndexResourcesNestedIncludes.vue?raw'
import IndexResourcesNestedIncludes from './examples/IndexResourcesNestedIncludes.vue'

import IndexResourcesFilterIncludedRaw from './examples/IndexResourcesFilterIncluded.vue?raw'
import IndexResourcesFilterIncluded from './examples/IndexResourcesFilterIncluded.vue'

import IndexResourcesAndOrIncludeRaw from './examples/IndexResourcesAndOrInclude.vue?raw'
import IndexResourcesAndOrInclude from './examples/IndexResourcesAndOrInclude.vue'

import IndexResourcesPaginationRaw from './examples/IndexResourcesPagination.vue?raw'
import IndexResourcesPagination from './examples/IndexResourcesPagination.vue'
</script>

# Index Resources

When indexing a resource, you'll likely want [`useIndexResources()`](../composables/02-use-index-resources.md). However at times we can't use the composition api. For that, we have `indexResources()`.

::: warning
Some backends do not support all the features on this page
:::

<ExamplePanel
  title="Basic Usage"
  :content="IndexResourcesBasicRaw"
  :exampleComponent="IndexResourcesBasic"
/>

## Includes
Also known as `expand`, `with` and `populate`. We can fetch related data and apply filters.

### Basic Include

<ExamplePanel
  title="Including Related Data"
  :content="IndexResourcesIncludesRaw"
  :exampleComponent="IndexResourcesIncludes"
/>

<ExamplePanel
  title="Deeply Nested Include"
  :content="IndexResourcesNestedIncludesRaw"
  :exampleComponent="IndexResourcesNestedIncludes"
/>

### Filtering Included Data

```js
indexResources(User, {
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
  :content="IndexResourcesFilterIncludedRaw"
  :exampleComponent="IndexResourcesFilterIncluded"
/>

With an `or` block. `and` blocks are also supported.

```js
indexResources(User, {
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
  title="Filtering Included Data With Or Block"
  :content="IndexResourcesAndOrIncludeRaw"
  :exampleComponent="IndexResourcesAndOrInclude"
/>

## Pagination
Of course, we can also paginate the results.

<ExamplePanel
  title="Filtering Included Data With Or Block"
  :content="IndexResourcesPaginationRaw"
  :exampleComponent="IndexResourcesPagination"
/>