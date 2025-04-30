<script lang="ts" setup>
import { useCreator } from '@vuemodel/core'
import { User } from '@vuemodel/sample-data'
import { indexedDbState } from '@vuemodel/indexeddb'

const userCreator = useCreator(User)

async function createUser () {
  indexedDbState.mockValidationErrors = {
    name: [
      'Must be more than 4 characters long',
      'Cannot contain any special characters',
    ],
    age: [
      'You must be over 18',
    ],
  }

  await userCreator.create()

  indexedDbState.mockValidationErrors = undefined
}

createUser()
</script>

<template>
  <div class="q-pa-md q-gutter-y-sm">
    <q-banner
      v-for="[field, errors] in Object.entries(userCreator.validationErrors.value ?? {})"
      :key="field"
      dense
      rounded
      class="bg-negative text-white"
    >
      <strong>{{ field }}</strong>
      <li
        v-for="error in errors"
        :key="error"
        class="q-ml-md"
      >
        {{ error }}
      </li>
    </q-banner>
  </div>
</template>
