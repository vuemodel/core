<script setup>
import UpdateBasicRaw from './examples/UpdateBasic.vue?raw'
import UpdateBasic from './examples/UpdateBasic.vue'
</script>

# Update Resource
```ts
const response = await update(Post, { title: 'VueModel UNLEASHED!!!' })
```

When updating a resource, you'll likely want to use the composable [`useUpdate()`](../composables/05-use-updater.md). However, at times we can't use the composition api. For that, we have the action `update()`.

<ExamplePanel
  title="Basic Usage"
  :content="UpdateBasicRaw"
  :exampleComponent="UpdateBasic"
/>

## The Response
`update`'s response is easy to understand. You can access the response using promises, or async/await.

```ts
// async/await
const response = await update(Post, { title: 'VueModel UNLEASHED!!!' })

// promise
update(Post, { title: 'VueModel UNLEASHED!!!' })
  .then(response => {
    console.log(resposne)
  })
```

### Success Response
A successful response looks like this:

```js
{
  action: 'update',
  success: true,
  record: {
    id: '1234',
    title: 'VueModel UNLEASHED!!!!',
    body: 'A natural way to work with your backend.',
    user_id: '1'
  }
}
```

Handling errors works similar for all CRUD actions. Take a look at [Handling Errors](./07-handling-errors.md) to find out more.