# Hooks
```ts
import { useCreator } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'

const postCreator = useCreator(Post, {
  onSuccess: (response) => {
    console.log('success!')
  },
  onError: (response, validationErrors) => {
    console.log('validation errors:', response.validationErrors)
  },
  onStandardError: (response) => {
    console.log(response.standardErrors)
  },
  onValidationError: (response) => {
    console.log('validation errors:', response.validationErrors)
  },
})
```

All of the composables have hooks for **error**, **success**, **standard error** and where it makes sense, **validation error**.

Note that a `onError` catches both validation errors, and standard errors. We decided to separate validation errors from standard errors, as it makes handling validation much easier!

::: info
VueModel has two kinds of errors.
- validation errors
- standard errors (errors that are not a validation error)
:::