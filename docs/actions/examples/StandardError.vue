<script lang="ts" setup>
import { Form, create, CreateResponse } from '@vuemodel/core'
import { piniaLocalStorageState } from '@vuemodel/indexeddb'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const mockStandardError = [
  { message: 'oops, something went wrong 🙊', name: 'oops' },
  { message: 'the whatsamathingy died ☠️', name: 'eep' },
]

const form = ref<Form<Post>>({ title: '' })
const response = ref<CreateResponse<typeof Post>>()

async function createPost () {
  piniaLocalStorageState.mockStandardErrors = mockStandardError
  response.value = await create(Post, form.value)
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

      <q-btn
        unelevated
        label="Create"
        color="primary"
        @click="createPost()"
      />
    </div>

    <div class="q-gutter-y-sm q-mt-md">
      <q-banner
        v-for="error in response?.standardErrors"
        :key="error.message"
        rounded
        dense
        class="text-white bg-negative"
      >
        {{ error.message }}
      </q-banner>
    </div>
  </div>
</template>
