<script setup>
import UseDestroyerBasicRaw from './examples/use-destroyer/UseDestroyerBasic.vue?raw'
import UseDestroyerBasic from './examples/use-destroyer/UseDestroyerBasic.vue'

import UseDestroyerDestroyingRaw from './examples/use-destroyer/UseDestroyerDestroying.vue?raw'
import UseDestroyerDestroying from './examples/use-destroyer/UseDestroyerDestroying.vue'

import UseDestroyerOptimisticRaw from './examples/use-destroyer/UseDestroyerOptimistic.vue?raw'
import UseDestroyerOptimistic from './examples/use-destroyer/UseDestroyerOptimistic.vue'

import UseDestroyerRecordResponseRaw from './examples/use-destroyer/UseDestroyerRecordResponse.vue?raw'
import UseDestroyerRecordResponse from './examples/use-destroyer/UseDestroyerRecordResponse.vue'
</script>

# `useDestroyer` Composable
```ts
import { useDestroyer } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'

const postId = ref('3')
const postDestroyer = useDestroyer(Post, { id: postId })
postDestroyer.destroy()
```

[[toc]]

There are two ways to destroy a record by id:
::: code-group
```ts [passed id]
const postId = ref('1')
const postDestroyer = useDestroyer(Post, { id: postId })
postDestroyer.destroy()
```

```ts [destroyer.destroy()]
postDestroyer.destroy('10')
```
:::

We tend to use the first example (passed id) more regularly, yet there's common scenarios for both.

<ExamplePanel
  title="UseDestroyerBasic"
  :exampleComponent="UseDestroyerBasic"
  :content="UseDestroyerBasicRaw"
/>

## `record`
```ts
const postDestroyer = useDestroyer(Post, { id: '1' })
await postDestroyer.destroy()
console.log(postDestroyer.record.value)
```

**`destroyer.record.value` works differently** to most other VueModel composables. When destroying a record, it no longer exists in the store so really it's just a clone of what was destroyed.

Note that when we set `optimistic: true`, the record is deleted from the store **before** the request is successful. This can help make our app responsive, at the cost of a "dishonest UI".

<ExamplePanel
  title="UseDestroyerRecordResponse"
  :exampleComponent="UseDestroyerRecordResponse"
  :content="UseDestroyerRecordResponseRaw"
/>

## Response

The response object is mostly for covering edge cases (like accessing data that didn't end up in the store). It's unlikely you'll need to use it.

## `destroying`
```ts
const postDestroyer = useDestroyer(Post, { id: '1' })
postDestroyer.destroy()
console.log(postDestroyer.destroying.value) // '1'
```

`destroying` is **not** a boolean, it's the **primary key** of the record being destroyed.

You'll often find yourself in situations where knowing if `destroying` is true, isn't enough. For that reason, we decided to make `destroying` the **id of the record being destroyed**. 

::: info
Feel free to coerce `destroying` to a boolean (as we do in many of these examples). You may need to do this at times to satisfy TypeScript:
```ts
!!destroyer.destroying.value
```
:::

<ExamplePanel
  title="UseDestroyerDestroying"
  :exampleComponent="UseDestroyerDestroying"
  :content="UseDestroyerDestroyingRaw"
/>

## `optimistic`
```ts
const postId = ref('10')
const postDestroyer = useDestroyer(Post, {
  id: postId,
  optimistic: true
})
```

When `optimistic` is true, the record is destroyed from the store before the backend request is successful. If the backend request then fails, the record is **inserted back into the store** for you!

<ExamplePanel
  title="UseDestroyerOptimistic"
  :exampleComponent="UseDestroyerOptimistic"
  :content="UseDestroyerOptimisticRaw"
/>



