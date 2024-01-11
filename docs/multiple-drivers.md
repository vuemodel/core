# Multiple Drivers
Adding a second driver with VueModel is easy! The example below sets up 3 drivers:

`main.ts` (or boot file)
```ts
const VueModel = createVueModel({
  default: 'local',
  drivers: {
    local: {
      implementation: piniaLocalVueModelDriver,
      config: { pinia },
    },
    orion: {
      implementation: orionDriver,
    },
    dataverse: {
      implementation: dataverseDriver,
    },
  },
})
```

Notice we set the `default` driver to **local**? This means all of VueModel's composables and actions will use **local** by default.

To use a different driver, pass the name of that driver as the first parameter!
```ts
const dataversePostsIndexer = useIndexer('dataverse', Post, { immediate: true })
const orionPostsIndexer = useIndexer('orion', Post, { immediate: true })
const localPostsIndexer = useIndexer('local', Post, { immediate: true })
```

It works the same with actions.
```ts
const response = await create('dataverse', Post, { title: 'My Post' })
```