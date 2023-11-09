<script setup>
import CreateResourceBasicRaw from './examples/CreateResourceBasic.vue?raw'
import CreateResourceBasic from './examples/CreateResourceBasic.vue'

import CreateResourceResponseRaw from './examples/CreateResourceResponse.vue?raw'
import CreateResourceResponse from './examples/CreateResourceResponse.vue'

import CreateResourceStandardErrorRaw from './examples/CreateResourceStandardError.vue?raw'
import CreateResourceStandardError from './examples/CreateResourceStandardError.vue'

import CreateResourceValidationErrorRaw from './examples/CreateResourceValidationError.vue?raw'
import CreateResourceValidationError from './examples/CreateResourceValidationError.vue'
</script>

# Create Resource

When creating a resource, you'll likely want [`useCreateResource()`](../composables/01-use-create-resource.md). However at times we can't use the composition api. For that, we have `createResource()`.

<ExamplePanel
  title="Basic Usage"
  :content="CreateResourceBasicRaw"
  :exampleComponent="CreateResourceBasic"
/>

## Responses
`createResource`'s response is easy to understand. You can access the response using promises, or async/await.

### async/await
```ts
const response = await createResource(Post, { title: 'VueModel' })
```

### .then
```ts
createResource(Post, { title: 'VueModel' })
  .then(response => {
    console.log(resposne)
  })
```

### Success Response
Let's take a look at a successful response:

```js
{
  action: 'create',
  success: true,
  record: {
    id: '1234',
    title: 'VueModel!',
    body: 'A natural way to work with your backend.',
    user_id: '1'
  }
}
```

<ExamplePanel
  title="Successful Response"
  :content="CreateResourceResponseRaw"
  :exampleComponent="CreateResourceResponse"
/>

We have two kinds of errors. **Standard errors**, and **validation errors**. Usually, these two kinds of errors are handled differently so we split them up.

## Standard Errors
<ExamplePanel
  title="Standard Errors"
  :content="CreateResourceStandardErrorRaw"
  :exampleComponent="CreateResourceStandardError"
/>

## Validation Errors
<ExamplePanel
  title="Validation Errors"
  :content="CreateResourceValidationErrorRaw"
  :exampleComponent="CreateResourceValidationError"
/>