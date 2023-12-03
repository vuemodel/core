<script lang="ts" setup>
import { useCreator, vueModelState } from '@vuemodel/core'
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage'
import { Post } from '@vuemodel/sample-data'
import { Notify } from 'quasar'

const fakeError = [{ name: 'oops', message: 'something went awry!' }]

// Usually, the code below would be in "main.ts" or a boot file
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

const postCreator = useCreator(Post, { notifyOnError: true })

async function createPost () {
  piniaLocalStorageState.mockStandardErrors = fakeError
  await postCreator.create()
  piniaLocalStorageState.mockStandardErrors = undefined
}
</script>

<template>
  <div class="q-pa-md">
    <q-btn
      label="Create"
      color="primary"
      unelevated
      @click="createPost()"
    />
  </div>
</template>
