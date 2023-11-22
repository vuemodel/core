<script setup>
import StandardErrorRaw from './examples/StandardError.vue?raw'
import StandardError from './examples/StandardError.vue'

import ValidationErrorRaw from './examples/ValidationError.vue?raw'
import ValidationError from './examples/ValidationError.vue'
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
Be default, **actions do not throw errors**. You can change that behaviour with the following configuration:
```ts
import { index, vueModelState } from '@vuemodel/core'

vueModelState.config.throw = true
```

Or, while calling the action:
```ts
create
```