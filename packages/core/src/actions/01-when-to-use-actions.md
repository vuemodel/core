# Actions Getting Started
Actions are the "bare bones" way of creating/updating/finding/indexing/destroying resources. **We usually only need them when we can't use composables**.

Here's some examples of where you might use one of the "actions".

1. Vue hasn't been created yet
`main.ts`
```ts
import { User } from '@vuemodel/sample-data'
import { find } from '@vuemodel/core'

find(User, '1').then(response => {
  console.log(response.record)
})

const app = createApp(App)
app.mount('#app')
```

2. Used with a package that might not have access to the composition api
`my-backend-config.ts`
```ts
import { createBackend } from 'some-backend-package'
import { find } from '@vuemodel/core'
import { User } from '@vuemodel/sample-data'

createBackend({
  getHeaders: async () => {
    const userResponse = await find(User, '1')
    
    return {
      'tenant-id': userResponse.record.tenant_id
    }
  }
})
```

3. Within a script, such as a cli tool (**yes**, you can use VueModel in your command line tools like node and bun!)

The example below was tested with bun. It's much easier to get running with typescript using esm (ECMAScript Modules).

::: code-group
```ts [createPost.ts]
import { program } from 'commander'
import { create } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { setupVueModel } from './setupVueModel'

setupVueModel()

program
  .option('--title <title>', 'Post Title')
  .option('--body <body>', 'Posts Body')
  .parse()

const options = program.opts()

const response = await create(Post, options)

console.log(response.record)
```

```ts [setupVueModel.ts]
import { createVueModel } from '@vuemodel/core'
import { createPiniaLocalStorage, piniaLocalVueModelDriver } from '@vuemodel/pinia-local-storage'
import { createPinia } from 'pinia'
import 'fake-indexeddb/auto' // node doesn't have indexeddb, so we fake it for this example

export function setupVueModel () {
  const pinia = createPinia()
  createPiniaLocalStorage({ frontStore: pinia })

  createVueModel({
    default: 'local',
    drivers: {
      local: {
        implementation: piniaLocalVueModelDriver,
        config: { pinia },
      },
    },
  })
}
```

```sh [Usage]
bun createPost.ts --title "Running with bun!" --body "Using VueModel in a cli tool run with bun works great!"
```

:::
 use VueModel in your command line tools like node and bun!)

The example below was tested with bun. It's much easier to get running with typescript using esm (ECMAScript Modules).

::: code-group
```ts [createPost.ts]
import { program } from 'commander'
import { create } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { setupVueModel } from './setupVueModel'

setupVueModel()

program
  .option('--title <title>', 'Post Title')
  .option('--body <body>', 'Posts Body')
  .parse()

const options = program.opts()

const response = await create(Post, options)

console.log(response.record)
```

```ts [setupVueModel.ts]
import { createVueModel } from '@vuemodel/core'
import { createPiniaLocalStorage, piniaLocalVueModelDriver } from '@vuemodel/pinia-local-storage'
import { createPinia } from 'pinia'
import 'fake-indexeddb/auto' // node doesn't have indexeddb, so we fake it for this example

export function setupVueModel () {
  const pinia = createPinia()
  createPiniaLocalStorage({ frontStore: pinia })

  createVueModel({
    default: 'local',
    drivers: {
      local: {
        implementation: piniaLocalVueModelDriver,
        config: { pinia },
      },
    },
  })
}
```

```sh [Usage]
bun createPost.ts --title "Running with bun!" --body "Using VueModel in a cli tool run with bun works great!"
```

:::
