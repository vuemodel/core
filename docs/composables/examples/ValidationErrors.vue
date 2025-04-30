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
</script>

<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md">
      <q-input
        v-model="userCreator.form.value.name"
        label="Name"
        filled
        :error="!!userCreator.validationErrors.value.name"
        :error-message="userCreator.validationErrors.value.name?.join('. ')"
        @update:model-value="delete userCreator.validationErrors.value.name"
      />

      <q-input
        v-model.number="userCreator.form.value.age"
        label="Age"
        filled
        type="number"
        :error="!!userCreator.validationErrors.value.age"
        :error-message="userCreator.validationErrors.value.age?.join('. ')"
        @update:model-value="delete userCreator.validationErrors.value.age"
      />

      <q-btn
        label="Create"
        color="primary"
        unelevated
        @click="createUser()"
      />
    </div>
  </div>
</template>
