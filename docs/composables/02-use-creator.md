<script setup>
import UseCreatorBasicRaw from './examples/UseCreatorBasic.vue?raw'
import UseCreatorBasic from './examples/UseCreatorBasic.vue'

import UseCreatorFormRaw from './examples/UseCreatorForm.vue?raw'
import UseCreatorForm from './examples/UseCreatorForm.vue'
</script>

# `useCreator` Composable
```ts
const postCreator = useCreator(Post)
```

## The Form
`useCreator` comes with a form that you can use!
```ts
const postCreator = useCreator(Post)
postCreator.form.value.title = 'My Blog Title'
postCreator.create()
```

<ExamplePanel
  title="Form"
  :content="UseCreatorFormRaw"
  :exampleComponent="UseCreatorForm"
/>

::: warning
It may be tempting to destructure useCreate (`const { form } = useCreate(Post)`). **We don't recommend this**. Destructuring removes context and makes it difficult to manage variable name clashes.
:::

## Accessing the record
