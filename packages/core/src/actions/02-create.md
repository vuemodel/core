<script setup>
import CreateBasicRaw from './examples/CreateBasic.vue?raw'
import CreateBasic from './examples/CreateBasic.vue'

import CreateResponseRaw from './examples/CreateResponse.vue?raw'
import CreateResponse from './examples/CreateResponse.vue'
</script>

# Create Resource

When creating a resource, you'll likely want [`useCreate()`](../composables/01-use-creator.md). However at times we can't use the composition api. For that, we have `create()`.

<ExamplePanel
  title="Basic Usage"
  :content="CreateBasicRaw"
  :exampleComponent="CreateBasic"
/>

## Responses
`create`'s response is easy to understand. You can access the response using promises, or async/await.

### async/await
```ts
const response = await create(Post, { title: 'VueModel' })
```

### .then
```ts
create(Post, { title: 'VueModel' })
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
  :content="CreateResponseRaw"
  :exampleComponent="CreateResponse"
/>