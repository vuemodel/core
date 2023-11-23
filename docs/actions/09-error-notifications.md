<script setup>
import NotifyOnErrorRaw from './examples/NotifyOnError.vue?raw'
import NotifyOnError from './examples/NotifyOnError.vue'
</script>

# Error Notifications
Sometimes when prototyping, it's unnecessary work displaying errors on the frontend. Instead, you may wish to **intercept** all requests, and **display a notification** when there's an error.

For this, we have `notifyOnError`.

We can tell VueModel how to handle errors, by setting up our `errorNotifiers` globally:
```ts
import { vueModelState } from '@vuemodel/core'

vueModelState.drivers.local.config = {
  errorNotifiers: {
    create: () => { return {} },
  },
}
```

Then we can either enable `notifyOnError` globally:
```ts
// this would be below the example code above
vueModelState.config.notifyOnError = { create: true }
```

Or pass `notifyOnError` to the actions config object:
```ts
const response = await create(
  Post,
  { notifyOnError: true }
)
```

<ExamplePanel
  title="Notify On Error"
  :content="NotifyOnErrorRaw"
  :exampleComponent="NotifyOnError"
/>

