<script setup>
import CreateBasicRaw from './examples/CreateBasic.vue?raw'
import CreateBasic from './examples/CreateBasic.vue'
</script>

# Create Resource
```ts
const response = await create(Post, { title: 'VueModel' })
```

When creating a resource, you'll likely want to use the composable [`useCreate()`](../composables/02-use-creator.md). However, at times we can't use the composition api. For that, we have the action `create()`.

<ExamplePanel
  title="Basic Usage"
  :content="CreateBasicRaw"
  :exampleComponent="CreateBasic"
/>

## The Response
`create`'s response is easy to understand. You can access the response using promises, or async/await.

```ts
// async/await
const response = await create(Post, { title: 'VueModel' })

// promise
create(Post, { title: 'VueModel' })
  .then(response => {
    console.log(resposne)
  })
```

### Success Response
A successful response looks like this:

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

Handling errors works similar for all CRUD actions. Take a look at [Handling Errors](./07-handling-errors.md) to find out more.