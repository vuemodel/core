<script setup>
import UseCreatorBasicRaw from './examples/UseCreatorBasic.vue?raw'
import UseCreatorBasic from './examples/UseCreatorBasic.vue'

import UseCreatorFormRaw from './examples/UseCreatorForm.vue?raw'
import UseCreatorForm from './examples/UseCreatorForm.vue'

import UseCreatorSpinnerRaw from './examples/UseCreatorSpinner.vue?raw'
import UseCreatorSpinner from './examples/UseCreatorSpinner.vue'
</script>

# `useCreator` Composable
```ts
const postCreator = useCreator(Post)
```

::: warning
It may be tempting to destructure useCreator (`const { form } = useCreator(Post)`). **We don't recommend this**. Destructuring removes context and makes it difficult to manage variable name clashes.
:::

## The Form
`useCreator` comes with a form that you can use!
```ts
const postCreator = useCreator(Post)
postCreator.form.value.title = 'My Blog Title'
postCreator.create()
```

<ExamplePanel
  title="Form"
  :content="UseCreatorFormRaw"
  :exampleComponent="UseCreatorForm"
/>

### `create(form)`
A form can also be passed directly to the `create` function.
```ts
const postCreator = useCreator(Post)
postCreator.create({ title: 'My Blog Title' })
```

We recommend trying to get most (if not all) your form data into `creator.form.value`. `create(form)` is a convenience to help cover edge cases.

### `useCreator(Model, { merge })`
You may want to define some default fields. For that, we have `merge`.
```ts
import { authState } from 'state/authState'

const postCreator = useCreator(Post, {
  merge: {
    used_id: authState.user.value.id
  }
})
postCreator.create({ title: 'My Blog Title' }) // user_id is merged into the form
```

We recommend trying to get most (if not all) your form data into `creator.form.value`. `merge` is a convenience to help cover edge cases.

### Form Merging Precedence
As detailed above, there are 3 ways to include form data:
- modifying `creator.form.value`
- passing a form to `creator.create(form)`
- `useCreator(Model, { form })`

VueModel uses a sensible precedence when merging the form:

`mergeData` <- `creator.form.value` <- `creator(form)`

## `record`
```ts
const postCreator = useCreator(Post)
await postCreator.create({ title: 'My Blog Title' })
console.log(postCreator.record.value)
```

When accessing `creator.record.value`, we're **pulling it out of the store**. This is good news! It means any changes to the record in other parts of your application will be reflected when using `creator.record.value`

Note that when we set `optimistic: true`, the record is inserted into the store **before** the request is successful. This can help make your app responsive, at the cost of a "dishonest UI".

## `response`
```ts
const postCreator = useCreator(Post)
await postCreator.create({ title: 'My Blog Title' })
console.log(postCreator.response.value)
```

::: warning
`response.value` **does NOT** return data from the store. Prefer `record.value` if you want a value that's responsive to other changes in your app.
:::

The response object is mostly for covering edge cases (like accessing data that didn't end up in the store). It's unlikely you'll need to use it.

## `creating`
Add a spinner with `creating.value`:
```html
<q-btn
  label="Create"
  @click="postCreator.create()"
  :loading="postCreator.creating.value"
/>
```

<ExamplePanel
  title="Spinner"
  :content="UseCreatorSpinnerRaw"
  :exampleComponent="UseCreatorSpinner"
/>

## Persisting to the store
You may want to **skip persisting to the store**. For that, we can pass `persist = false` to options.

The example below logs `undefined` because `record.value` pulls from the store:
```ts
const postCreator = useCreator(Post, { persist: false })
await postCreator.create({ title: 'My Blog Title' })
console.log(postCreator.record.value) // logs undefined
console.log(postCreator.response.value.record) // logs the record
```

::: info
In the example above, notice that `postCreator.response.value.record` returns the record, yet `postCreator.record.value` returns `undefined`. This is because `record` always fetches from the store. Since `persist` is `false`, no item was inserted into the store.
:::

## `activeRequests.value`
Sometimes, the app might be creating more than one record at the same time. For example, if the UI allows users to start creating a second record before the first request is complete.

When more than one request is active:
1. `response.value` is equal to the latest response
2. `record.value` is found using the ID of the latest successful response
3. all active requests are available via `activeRequests.value`

