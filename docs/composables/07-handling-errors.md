<script setup>
import ValidationErrorsRaw from './examples/ValidationErrors.vue?raw'
import ValidationErrors from './examples/ValidationErrors.vue'

import ValidationErrorsSimpleRaw from './examples/ValidationErrorsSimple.vue?raw'
import ValidationErrorsSimple from './examples/ValidationErrorsSimple.vue'

import StandardErrorsSimpleRaw from './examples/StandardErrorsSimple.vue?raw'
import StandardErrorsSimple from './examples/StandardErrorsSimple.vue'

import NotifyOnErrorRaw from './examples/NotifyOnError.vue?raw'
import NotifyOnError from './examples/NotifyOnError.vue'
</script>

# Handling Errors
The way we handle errors in VueModel is wonderful, you're going to love it.

## Standard Errors vs Validation Errors
VueModel splits errors into two categories. **"Validation errors"**, and **"standard errors"**. Thinking of "standard errors" as "any error that isn't a validation error".

### Validation Errors
```ts
{
  name: [
    'Must be more than 4 characters long',
    'Cannot contain any special characters'
  ],
  age: [
    'You must be over 18',
  ]
}
```

Validation errors have a simple, predictable structure, regardless of the backend you choose! This is great news, because it makes them easy to work with.

Validation errors are keyed by name, and this makes them easy to work with in forms! Look at the code for adding these errors to Quasar's "QInput" component:
```html
<q-input
  v-model="userCreator.form.value.name"
  label="Name"
  :error="!!userCreator.validationErrors.value.name"
  :error-message="userCreator.validationErrors.value.name?.join('. ')"
/>
```

And here's a fleshed out example. Note this is purely focused on backend validation. Frontend validation goes beyond the scope of VueModel.
<ExamplePanel
  title="Validation Errors"
  :content="ValidationErrorsRaw"
  :exampleComponent="ValidationErrors"
/>

And a simpler implementaion where all validation errors are handled in one place.
<ExamplePanel
  title="Validation Errors"
  :content="ValidationErrorsSimpleRaw"
  :exampleComponent="ValidationErrorsSimple"
/>

### Standard Errors
```ts
[
  {
    name: 'unauthorized',
    message: 'The IP used to make this request is not authorized'
  }
]
```

Only the "name" and "message" are required in standard errors however, depending on your implementation `httpStatus` and `details` might also be included.
```ts
[
  {
    name: 'unauthorized'
    message: 'The IP used to make this request is not authorized',
    httpStatus: 401,
    details: {
      additional: 'details'
    }
  }
]
```

::: warning
Note that `standardErrors.value` is an array, and `validationErrors.value` is an object.
:::

A standard error is any error that's **not a validation error**.

Here's an example of how we can render standard errors:
<ExamplePanel
  title="Standard Errors"
  :content="StandardErrorsSimpleRaw"
  :exampleComponent="StandardErrorsSimple"
/>

## Error Notifications (`notifyOnError`)
Sometimes when prototyping, it's unnecessary work displaying errors on the frontend. Instead, you may wish to **intercept** all requests, and **display a notification** when there's an error.

For this, we have `notifyOnError`.

We can tell VueModel how to handle errors, by setting up our `errorNotifiers` globally:
```ts
// main.ts (or in a boot file)
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

Or pass `notifyOnError` to the composable:
```ts
const postCreator = useCreate(
  Post,
  { notifyOnError: true }
)
```

<ExamplePanel
  title="Notify On Error"
  :content="NotifyOnErrorRaw"
  :exampleComponent="NotifyOnError"
/>

