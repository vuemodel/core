# Optimistic

## Optimistic Records (`options.optimistic`)
An "optimistic" UI is one that **assumes** requests will be successful. In other words, instead of showing a loading spinner when a record is created/updated/destroyed we **assume the request was successful** and immediately update the store.

Apps like trello use a similar strategy to create a snappy UI!

VueModel even rolls back - kinda like an "undo" - when the request fails in the following ways:
- **failed create**: delete the record from the store
- **failed update**: change the value back to what it originally was
- **failed destroy**: insert the record back into the store

Only create, update and destroy support optimistic:
```ts
import { Post } from '@vuemodel/sample-data'

const postCreator = useCreator(Post, { optimistic: true })
const postUpdater = useUpdater(Post, { optimistic: true })
const postDestroyer = useDestroyer(Post, { optimistic: true })
```

We can also set optimistic at a driver level, or globally. This means the entire app will use optimistic, unless otherwise stated.
```ts
const vueModel = createVueModel({
  default: 'local',
  config: {
    optimistic: true, // globally (applied to all drivers)
  },
  drivers: {
    local: {
      driver: piniaLocalVueModelDriver,
      config: {
        optimistic: true, // only applied to the "local" driver
      },
    },
  },
})
```
