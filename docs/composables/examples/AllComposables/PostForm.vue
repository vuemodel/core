<script lang="ts" setup>
import { Post, User } from '@vuemodel/sample-data'
import { Form } from '@vuemodel/core'
import { Collection } from 'pinia-orm'

interface Props {
  users: Collection<User>
}
defineProps<Props>()

const modelValue = defineModel<Form<Post>>({ default: {} })
</script>

<template>
  <q-form class="q-gutter-md">
    <q-input
      v-model="modelValue.title"
      label="Title"
      filled
    />
    <q-input
      v-model="modelValue.body"
      type="textarea"
      label="Body"
      filled
    />
    <q-select
      v-model="modelValue.user_id"
      label="Author"
      filled
      :options="users"
      option-label="name"
      option-value="id"
      map-options
      emit-value
    />
  </q-form>
</template>
