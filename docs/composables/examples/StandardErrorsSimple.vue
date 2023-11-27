<script lang="ts" setup>
import { useCreator } from '@vuemodel/core'
import { User } from '@vuemodel/sample-data'
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage'

const userCreator = useCreator(User)

async function createUser () {
  piniaLocalStorageState.mockStandardErrors = [
    {
      name: 'unauthorized',
      message: 'The IP used to make this request is not authorized',
    },
  ]
  await userCreator.create()

  piniaLocalStorageState.mockValidationErrors = undefined
}

createUser()
</script>

<template>
  <div class="q-pa-md q-gutter-y-sm">
    <q-banner
      v-for="error in userCreator.standardErrors.value ?? []"
      :key="error.name"
      rounded
      dense
      class="bg-negative text-white"
    >
      <strong>{{ error.name }}</strong>:
      {{ error.message }}
    </q-banner>
  </div>
</template>
