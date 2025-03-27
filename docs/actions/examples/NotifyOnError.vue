<script lang="ts" setup>
import { Form, create, CreateResponse, vueModelState } from '@vuemodel/core'
import { piniaLocalStorageState } from '@vuemodel/indexeddb'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'
import { Notify } from 'quasar'

if (vueModelState.drivers.local.config) {
  vueModelState.drivers.local.config.errorNotifiers = {
    create: (response) => {
      const message = response.errors.standardErrors[0].message ?? 'unknown error'
      Notify.create({
        message: `${response.model.entity} error: ${message}`,
        color: 'negative',
      })
    },
  }
}

const form = ref<Form<Post>>({ title: '' })
const response = ref<CreateResponse<typeof Post>>()

async function createPost () {
  // the "indexeddb" driver makes it easy
  // to create a mock error for testing!
  piniaLocalStorageState.mockStandardErrors = [{
    name: 'oops',
    message: 'something went awry!',
  }]

  response.value = await create(
    Post,
    form.value,
    { notifyOnError: true },
  )

  piniaLocalStorageState.mockStandardErrors = undefined
}
</script>

<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md">
      <q-input
        v-model="form.title"
        label="Title"
        filled
      />

      <q-input
        v-model="form.body"
        type="textarea"
        label="Body"
        filled
      />

      <q-btn
        label="Create"
        color="primary"
        unelevated
        @click="createPost()"
      />
    </div>

    <pre v-if="response">{{ response }}</pre>
  </div>
</template>
