<script lang="ts" setup>
import { Form, useCreateResource, useIndexResources } from '@vuemodel/core'
import { User, Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const userCreator = useCreateResource(User)
const usersIndexer = useIndexResources(User, {
  immediate: true,
  includes: { posts: {} }
})

const postCreator = useCreateResource(Post)
</script>

<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md">
      <h3>Create User</h3>
      
      <q-input
        v-model="userCreator.form.value.name"
        label="Name"
        filled
      />

      <q-input
        v-model="userCreator.form.value.email"
        label="Email"
        filled
      />

      <q-input
        v-model.number="userCreator.form.value.age"
        type="number"
        label="Age"
        filled
      />

      <q-btn
        label="Create User"
        color="primary"
        :loading="userCreator.creating.value"
        @click="userCreator.create()"
      />
    </div>

    <q-separator />

    <div class="q-gutter-y-md">
      <h3>Create Post</h3>
      
      <q-input
        v-model="postCreator.form.value.title"
        label="Title"
        filled
      />

      <q-input
        v-model="postCreator.form.value.body"
        label="Body"
        type="textarea"
        filled
      />

      <q-select
        v-model="postCreator.form.value.user_id"
        emit-value
        map-options
        option-label="name"
        option-value="id"
        :options="usersIndexer.records.value"
        label="Author"
        filled
      />

      <q-btn
        label="Create Post"
        color="primary"
        :loading="postCreator.creating.value"
        @click="postCreator.create()"
      />
    </div>

    <q-expansion-item
      class="shadow-1 q-mt-md"
      label="Users With Posts"
    >
      <pre>{{ usersIndexer.records.value }}</pre>
    </q-expansion-item>
  </div>
</template>
