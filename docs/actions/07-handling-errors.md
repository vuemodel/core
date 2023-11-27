<script setup>
import StandardErrorRaw from './examples/StandardError.vue?raw'
import StandardError from './examples/StandardError.vue'

import ValidationErrorRaw from './examples/ValidationError.vue?raw'
import ValidationError from './examples/ValidationError.vue'

import NotifyOnErrorRaw from './examples/NotifyOnError.vue?raw'
import NotifyOnError from './examples/NotifyOnError.vue'
</script>

# Handling Errors
We have two kinds of errors. **Standard errors**, and **validation errors**. Usually, these two kinds of errors are handled differently so we split them up.

## Standard Errors
<ExamplePanel
  title="Standard Errors"
  :content="StandardErrorRaw"
  :exampleComponent="StandardError"
/>

## Validation Errors
<ExamplePanel
  title="Validation Errors"
  :content="ValidationErrorRaw"
  :exampleComponent="ValidationError"
/>

## Throwing Errors
Be default, **actions do not throw errors**. You can change that behaviour **globally** with the following configuration:
```ts
import { index, vueModelState } from '@vuemodel/core'

vueModelState.config.throw = true
```

Or **locally**, by setting `throw: true` while calling the action:
```ts
const response = await create(
  Post,
  { title: 'Vue backend unleashed!' },
  { throw: true }
)
```

# Error Notifications
Sometimes when prototyping, it's unnecessary work displaying errors on the frontend. Instead, you may wish to **intercept** all requests, and **display a notification** when there's an error.

For this, we have `notifyOnError`.

We can tell VueModel how to handle errors, by setting up our `errorNotifiers` globally:
```ts
// main.ts (or in a boot file if using Quasar)
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
