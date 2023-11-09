<script setup>
import BasicExampleRaw from './examples/BasicExample.vue?raw'
import BasicExample from './examples/BasicExample.vue'
</script>

# Getting Started

## You will need:
- [pinia](https://pinia.vuejs.org/getting-started.html) (the "store")
- [pinia-orm](https://pinia-orm.codedredd.de/) (a gorgeous layer atop pinia)
- VueModel Core
- A driver (we recommend "pinia-local-storage" because it means you don't need a server!)

::: code-group

```sh [pnpm]
pnpm add pinia pinia-orm @vuemodel/core @vuemodel/pinia-local-storage
```

```sh [yarn]
yarn add pinia pinia-orm @vuemodel/core @vuemodel/pinia-local-storage
```

```sh [npm]
npm install pinia pinia-orm @vuemodel/core @vuemodel/pinia-local-storage
```

```sh [bun]
bun add pinia pinia-orm @vuemodel/core @vuemodel/pinia-local-storage
```

:::

## Setup
Here's how we get everything up and running!

::: code-group

```ts [main.js]
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createORM } from 'pinia-orm'
import { createVueModel } from '@vuemodel/core'
import { createPiniaLocalStorage, piniaLocalVueModelDriver } from '@vuemodel/pinia-local-storage'

const pinia = createPinia()
const piniaOrm = createORM()

pinia.use(piniaOrm)
const piniaLocalStorage = createPiniaLocalStorage({
  frontStore: pinia,
})

const vueModel = createVueModel({
  default: 'local',
  drivers: {
    local: {
      ...piniaLocalVueModelDriver,
      config: { pinia }
    }
  },
})

const app = createApp({})

app.use(pinia)
app.use(vueModel)
app.use(piniaLocalStorage)
app.use(piniaOrm)
```

```ts [vue-model.ts (Quasar boot file)]
import { boot } from 'quasar/wrappers'
import { createApp } from 'vue'
import { createVueModel } from '@vuemodel/core'
import { createPiniaLocalStorage, piniaLocalVueModelDriver } from '@vuemodel/pinia-local-storage'

export default boot(({ app, store }) => {
  const piniaLocalStorage = createPiniaLocalStorage({
    frontStore: store,
  })

  const vueModel = createVueModel({
    default: 'local',
    drivers: {
      local: {
        ...piniaLocalVueModelDriver,
        config: { pinia: store }
      }
    },
  })

  const app = createApp({})

  app.use(vueModel)
  app.use(piniaLocalStorage)
})

```

:::

Want to be able to test loading? If you're using "pinia-local-storage", consider adding a "mock latency". This is kinda like mimicking a slower internet connection.

```ts
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage'

piniaLocalStorageState.mockLatencyMs = 250 // add a 250ms delay to every request
```

## Create your first Model
We use [PiniaORM](https://pinia-orm.codedredd.de/) to manage models on the frontend. This doc will give examples to get you up and running, yet we **highly recommend** going through the [PiniaORM Documentation](https://pinia-orm.codedredd.de/). It's the foundation of VueModel.

To start, we sugget creating a `src/models` directory for your models.

(copied from [https://pinia-orm.codedredd.de/guide/getting-started/quick-start](https://pinia-orm.codedredd.de/guide/getting-started/quick-start))

### User Model

::: code-group

```js [src/models/User.js]
// User Model
import { Model } from 'pinia-orm'
export default class User extends Model {
  // entity is a required property for all models.
  static entity = 'users'
  // List of all fields (schema) of the post model. `this.string()` declares
  // a string field type with a default value as the first argument.
  // `this.uid()` declares a unique id if none provided.
  static fields () {
    return {
      id: this.uid(),
      name: this.string(''),
      email: this.string('')
    }
  }
  // For typescript support of the field include also the next lines
  declare id: string
  declare name: string
  declare email: string
}
```

```ts [src/models/User.ts]
// User Model

import { Model } from 'pinia-orm'
import { Str, Uid } from 'pinia-orm/decorators'

export default class User extends Model {
  // entity is a required property for all models.
  static entity = 'users'

  @Uid() declare id: string
  @Str('') declare name: string
  @Str('') declare email: string
}
```

:::

### Post Model

::: code-group

```js [src/models/Post.js]
// Post Model

import { Model } from 'pinia-orm'
import User from './User'

export default class Post extends Model {
  static entity = 'posts'

  // `this.belongsTo(...)` declares this post belongs to a user. The first
  // argument is the `User` model class. The second is the field name for
  // the foreign key `userId`.
  static fields () {
    return {
      id: this.uid(),
      userId: this.attr(null),
      title: this.string(''),
      body: this.string(''),
      published: this.boolean(false),
      author: this.belongsTo(User, 'userId')
    }
  }
  
  declare id: string
  declare userId: string | null
  declare title: string
  declare body: string
  declare published: boolean
  declare author: User | null
}
```

```ts [src/models/Post.ts]
// Post Model

import { Model } from 'pinia-orm'
import { Attr, BelongsTo, Bool, Str, Uid } from 'pinia-orm/decorators'
import User from './User'

export default class Post extends Model {
  static entity = 'posts'

  @Uid() declare id: string
  @Attr(null) declare userId: string | null
  @Str('') declare title: string
  @Str('') declare body: string
  @Bool(false) declare published: boolean
  @BelongsTo(() => User, 'userId') declare author: User | null
}
```

:::

### Usage
To give you a taste of what's to come, here's how we can create a resource! All examples in this doc use [Quasar](https://quasar.dev/) for the UI.

<ExamplePanel
  title="Basic Example"
  :content="BasicExampleRaw"
  :exampleComponent="BasicExample"
/>