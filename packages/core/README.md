# core
Core repository for contracts and implementations of VueModel

# WIP
VueModel aims to abstract the "play" between vue and the backend.

To start, it will be solely focused on using the composition API and aim to have implementations for:
- Strapi
- Laravel (Using [Laravel Orion](https://github.com/tailflow/laravel-orion))
- Supabase (Which already contains a [Proof of Concept](https://github.com/vuemodel/supabase))

I'll likely focus on support for **GraphQl** when those three are implemented.

# A little more...
The idea, is that you'll be able to easily "sync" your frontend and backend data with code like this:

```vue
<script setup>
const { form, create, creating, error } = useModel(Todo)
</script>

<template>
<input v-model="form.title">

<button :disabled="creating" @click="create">create</button>

<span v-if="creating">creating...</span>
<span v-if="error">{{ error.message }}</span>
</template>
```

Yes, related data too!

```js
const { include, fetch, fetching, errors, collection: todos } = useModelCollection(TodoList)

include.value = [
  'author',
  'todos.comments'
]

async function fetchTodos () {
  await fetch()
  console.log(errors)
  console.log(todos.value)
}
```

Note the `consle.log(todos.value)`. This library will also manage state (using [Vuex ORM](https://github.com/vuex-orm/vuex-orm)... but state will also adhere to contracts that we'll be able to swap out!)

Code like the above always works the same way, and the final abstraction can be unified among backends! And that's the goal of this library:
**Frontend/Backend Unification**

Stay tuned!
