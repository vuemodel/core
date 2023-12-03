# Actions Getting Started
Actions are the "bare bones" way of creating/updating/finding/indexing/destroying resources. **We usually only need them when we can't use composables**.

::: warning
Actions are "bare bones" (nothing is inserted into the store).
:::

Here's some examples of where you might use **actions rather than composables**.

## 1. Vue hasn't been created yet
Sometimes, requests to our backend needs to be made early in our applications lifecycle. For example, we may need to make a request before Vue is instantiated. In these scenarios, we can reach for actions:

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

## 2. External Packages
Some packages might require configuration that doesn't have access to the composition API. In theese scenarios, we would have to use actions:

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

## 3. Script/Cli Tool
**Yes**, we can use VueModel in our command line tools like node and bun!

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

The example below was tested with bun. It's much easier to get a modern typescript project running with bun.

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

:::

Usage
```sh
bun createPost.ts --title "Running with bun!" --body "Using VueModel in a cli tool run with bun works great!"
```

Of course, this example is naive and for demonstration purposes only. You'll likely need to handle environment variables and auth tokens when building a CLI tool like the one above.