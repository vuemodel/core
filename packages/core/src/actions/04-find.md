<script setup>
import FindBasicRaw from './examples/FindBasic.vue?raw'
import FindBasic from './examples/FindBasic.vue'
</script>

# Find Resource
```ts
const response = await find(Post, '5')
```

When finding a resource, you'll likely want to use the composable [`useFind()`](../composables/06-use-finder.md). However, at times we can't use the composition api. For that, we have the action `find()`.

<ExamplePanel
  title="Basic Usage"
  :content="FindBasicRaw"
  :exampleComponent="FindBasic"
/>

## The Response
`find`'s response is easy to understand. You can access the response using promises, or async/await.

```ts
// async/await
const response = await find(Post, { title: 'VueModel UNLEASHED!!!' })

// promise
find(Post, { title: 'VueModel UNLEASHED!!!' })
  .then(response => {
    console.log(resposne)
  })
```

### Success Response
A successful response looks like this:

```js
{
  record: {
    "id": "1",
    "tenant_id": "1",
    "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    "body": "quia et suscipit\nnsuscipit recusandae consequuntur expedita et cum\nnreprehenderit molestiae ut ut quas totam\nnnostrum rerum est autem sunt rem eveniet architecto",
    "created_at": "2023-01-13T07:55:59.107Z",
    "user_id": "1"
  },
  success: true,
  action: "find"
}
```

Handling errors works similar for all CRUD actions. Take a look at [Handling Errors](./07-handling-errors.md) to find out more.