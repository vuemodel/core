<script setup>
import AllComposablesRaw from './examples/AllComposables/AllComposables.vue?raw'
import AllComposables from './examples/AllComposables/AllComposables.vue'
</script>

# Composables Overview

<ExamplePanel
  title="All Composables!"
  :content="AllComposablesRaw"
  :exampleComponent="AllComposables"
/>

VueModel's composables make working with a backend bliss. It goes one step further than most frameworks by making **assumptions**, and being **opinionated**. For example:

- PiniaORM is used to manage state
- Typing (and autocomplete) is high priority
- configs can always be set at 3 levels: **global**, **driver**, **when used**.
  - global: `config.optimistic = true`
  - driver: `driver.{driver}.config.optimistic = true`
  - when used: `useCreator(Post, { optimistic: true })`

All the composables work similar to oneanother, and have naming conventions that aim to be as obvious as possible.