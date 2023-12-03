<script setup>
import UseUpdaterAutoUpdateRaw from './examples/use-updater/UseUpdaterAutoUpdate.vue?raw'
import UseUpdaterAutoUpdate from './examples/use-updater/UseUpdaterAutoUpdate.vue'

import UseUpdaterBasicRaw from './examples/use-updater/UseUpdaterBasic.vue?raw'
import UseUpdaterBasic from './examples/use-updater/UseUpdaterBasic.vue'

import UseUpdaterImmediatelyMakeFormRaw from './examples/use-updater/UseUpdaterImmediatelyMakeForm.vue?raw'
import UseUpdaterImmediatelyMakeForm from './examples/use-updater/UseUpdaterImmediatelyMakeForm.vue'

import UseUpdaterMakingFormRaw from './examples/use-updater/UseUpdaterMakingForm.vue?raw'
import UseUpdaterMakingForm from './examples/use-updater/UseUpdaterMakingForm.vue'

import UseUpdaterMergeRaw from './examples/use-updater/UseUpdaterMerge.vue?raw'
import UseUpdaterMerge from './examples/use-updater/UseUpdaterMerge.vue'

import UseUpdaterOptimisticRaw from './examples/use-updater/UseUpdaterOptimistic.vue?raw'
import UseUpdaterOptimistic from './examples/use-updater/UseUpdaterOptimistic.vue'

import UseUpdaterRecordResponseRaw from './examples/use-updater/UseUpdaterRecordResponse.vue?raw'
import UseUpdaterRecordResponse from './examples/use-updater/UseUpdaterRecordResponse.vue'

import UseUpdaterUpdatingIdRaw from './examples/use-updater/UseUpdaterUpdatingId.vue?raw'
import UseUpdaterUpdatingId from './examples/use-updater/UseUpdaterUpdatingId.vue'

import UseUpdaterValidationErrorsRaw from './examples/use-updater/UseUpdaterValidationErrors.vue?raw'
import UseUpdaterValidationErrors from './examples/use-updater/UseUpdaterValidationErrors.vue'

</script>

# `useUpdater` Composable
```ts
import { useUpdater } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'

const postId = ref('1')
const postUpdater = useUpdater(Post, { id: postId })
postUpdater.form.value.title = 'New Title'
postUpdater.update()
```

[[toc]]

::: warning
It may be tempting to destructure useUpdater (`const { form } = useUpdater(Post)`). **We don't recommend this**. Destructuring blurs the context, and makes it difficult to manage variable name clashes.
:::

## The Form
`useUpdater` comes with a form that you can use!
```ts
const postId = ref('1')
const postUpdater = useUpdater(Post, { id: postId })
postUpdater.form.value.title = 'New Title'
postUpdater.update()
```

We can also use `updater.makeForm()` to prepopulate the form.

<ExamplePanel
  title="UseUpdaterBasic"
  :exampleComponent="UseUpdaterBasic"
  :content="UseUpdaterBasicRaw"
/>

When the `id` changes, we usually want the form to change too so that the form always matches the id. For that, we can set `immediatelyMakeForm` to `true`.

<ExamplePanel
  title="UseUpdaterImmediatelyMakeForm"
  :exampleComponent="UseUpdaterImmediatelyMakeForm"
  :content="UseUpdaterImmediatelyMakeFormRaw"
/>

How cool is that? And you may notice this works, even if the record we want to update isn't in the store yet!

## How Making The Form Works
`makeForm` has two ways it tries to populate the form:
1. It checks if the record we want to update is **already in the store**. If it exists, we use that record to populate the form.
2. If the records is **not in the store**, it attempts to **find it on the backend**. When found on the backend, it uses that found record to populate the store.

This is awesome, because it means all you have to do is call `makeForm()` - or set `immediatelyMakeForm: true` - and it will populate the form as quickly as it can!

And if we ever need to "refresh" the form, we can simply call `makeForm()` again.

::: info
To find the record on the backend, we actually use `useFinder` under the hood! We can access this finder via `updater.makeFormFinder`. This might be useful if we want to display errors encountered when finding the resource.
:::

### Update Signatures
There are a few ways to provide `useUpdater` with a form and id. We already showed you how to use `updater.form.value` in the above examples. Here are the other ways:

Pass the `id` as a parameter
```ts
updater.update('1')
```

Pass the `id` and `form` as a parameter:
```ts
updater.update('1', { title: 'VueModel Is Your Friend!' })
```

Pass the `form` as a parameter:
```ts
const postId = ref('1')
const postUpdater = useUpdater(Post, { id: postId })
postUpdater.update({ title: 'VueModel Is Your Friend!' })
```

Pass the `form`, with an id in it, as a parameter. `useUpdater` is smart enough to discover the id by looking at the form.
```ts
updater.update({ id: '1', title: 'VueModel Is Your Friend!' })
```

We recommend trying to get most (if not all) your form data into `updater.form.value`. These other ways of updating, are a convenience to help cover edge cases.

### Form Merging Precedence
As detailed above, there are 2 ways to include form data:
- modifying `updater.form.value`
- passing a form to `updater.update(form)`

VueModel uses a sensible precedence when merging the form:

`updater.form.value` <- `updater.update(form)`

<ExamplePanel
  title="Form Merging Precedence"
  :exampleComponent="UseUpdaterMerge"
  :content="UseUpdaterMergeRaw"
/>

## `record`
```ts
const postUpdater = useUpdater(Post, { id: '1' })
await postUpdater.update({ title: 'My Blog Title' })
console.log(postUpdater.record.value)
```

When accessing `updater.record.value`, we're **pulling it out of the store**. This is good news! It means any changes to the record in other parts of our application will be reflected when using `updater.record.value`

Note that when we set `optimistic: true`, the record is inserted into the store **before** the request is successful. This can help make our app responsive, at the cost of a "dishonest UI".

<ExamplePanel
  title="UseUpdaterRecordResponse"
  :exampleComponent="UseUpdaterRecordResponse"
  :content="UseUpdaterRecordResponseRaw"
/>

## `response`
```ts
const postUpdater = useUpdater(Post, { id: '3' })
await postUpdater.update({ title: 'My Blog Title' })
console.log(postUpdater.response.value)
```

::: warning
`response.value` **does NOT** return data from the store. Prefer `record.value` if you want a value that's responsive to other changes in your app.
:::

The response object is mostly for covering edge cases (like accessing data that didn't end up in the store). It's unlikely you'll need to use it.

## persist
```ts
const postUpdater = useUpdater(Post, {
  id: '3',
  persist: false
})
```

We can use `persist: false` to skip persiting the record to the store. In such a scenario, we would need to access the record via `response.value`.

## `updating`
```ts
const postUpdater = useUpdater(Post, { id: '1' })
postUpdater.update()
console.log(postUpdater.updating.value) // '1'
```

`updating` is **not** a boolean, it's the **primary key** of the record being updated.

You'll often find yourself in situations where knowing if `updating` is true, isn't enough. For that reason, we decided to make `updating` the **id of the record being updated**. 

::: info
Feel free to coerce `updating` to a boolean (as we do in many of these examples). You may need to do this at times to satisfy TypeScript:
```ts
!!updater.updating.value
```
:::

<ExamplePanel
  title="UseUpdaterUpdatingId"
  :exampleComponent="UseUpdaterUpdatingId"
  :content="UseUpdaterUpdatingIdRaw"
/>

## `makingForm`
```ts
const postUpdater = useUpdater(Post, { id: '3' })
postUpdater.makeForm()
console.log(postUpdater.makingForm.value) // '3'
```
Similar to `updating.value`, `makingForm.value` equals the ID of the form currently being made. This is useful if you want to disable/hide the form while it's being populated.

<ExamplePanel
  title="UseUpdaterMakingForm"
  :exampleComponent="UseUpdaterMakingForm"
  :content="UseUpdaterMakingFormRaw"
/>

## Auto Update
```ts
const postUpdater = useUpdater(Post, {
  id: '1',
  autoUpdate: true,
  // autoUpdateDebounce: 250,
})
```

If you like, VueModel can watch your form and automatically update when changes occur. Feel free to set your own debouncer with the `autoUpdateDebounce` option.

<ExamplePanel
  title="UseUpdaterAutoUpdate"
  :exampleComponent="UseUpdaterAutoUpdate"
  :content="UseUpdaterAutoUpdateRaw"
/>

::: tip
Combining `autoUpdate: true` with `optimistic: true` can create a snappy experience for your app!
:::

## `optimistic`
```ts
const postUpdater = useUpdater(Post, {
  id: '1',
  optimistic: true,
})
```

An "optimistic" UI **assumes success** before the request is complete. We probably don't want to use it everywhere in our app, yet in some situations it creates a wonderful user experience!

[Trello](https://trello.com/) is a great example of an optimistic UI. When cards are moved and text changed, the UI updates instantly before the data is synced with the backend.

Notice in the example below, **the record updates immediately** while the "update" spinner is still turning!

<ExamplePanel
  title="UseUpdaterOptimistic"
  :exampleComponent="UseUpdaterOptimistic"
  :content="UseUpdaterOptimisticRaw"
/>

If the update fails, **the record is reverted** to it's original value in the store!

## `activeRequests`
Sometimes, the app might be updating more than one record at the same time. For example, if the UI allows users to start updating a second record before the first request is complete.

When more than one request is active:
1. `response.value` is equal to the latest response
2. `record.value` is found using the ID of the latest successful response
3. all active requests are available via `activeRequests.value`

## Validation Errors
To go deeper on handling errors, checkout [handling errors](/composables/07-handling-errors.html).

We have an example below of how this work with an update form:

<ExamplePanel
  title="UseUpdaterValidationErrors"
  :exampleComponent="UseUpdaterValidationErrors"
  :content="UseUpdaterValidationErrorsRaw"
/>

::: info
If you'd like to do frontend validation, we recommend [VeeValidate](https://vee-validate.logaretm.com/v4/). If in the future, VueModel decides to tackle validation, it will likely use VeeValidate under the hood.
:::