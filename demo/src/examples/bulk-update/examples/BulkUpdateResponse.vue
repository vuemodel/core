<script lang="ts" setup>
import { useBulkUpdater, useIndexer } from '@vuemodel/core'
import { populateRecords, User } from '@vuemodel/sample-data'
import { clear } from 'idb-keyval'
import UpdateUsersForms from './UpdateUsersForms.vue'
import { piniaLocalStorageState } from '@vuemodel/indexeddb'

const usersIndexer = useIndexer(User)
async function setUsers () {
  await clear()
  await populateRecords('users')
  await usersIndexer.index()
  usersBulkUpdater.makeForms()
}
setUsers()

const usersBulkUpdater = useBulkUpdater(User)

async function updateWithValidationErrors () {
  piniaLocalStorageState.mockValidationErrors = {
    1: {
      name: ['name field is required'],
    },
    2: {
      email: ['please enter a valid email'],
    },
  }

  await usersBulkUpdater.update()

  piniaLocalStorageState.mockValidationErrors = undefined
}

async function updateWithStandardErrors () {
  piniaLocalStorageState.mockStandardErrors = [
    {
      message: 'the server did not like your request',
      name: 'bad request',
      httpStatus: 500,
    },
  ]

  await usersBulkUpdater.update()

  piniaLocalStorageState.mockStandardErrors = undefined
}
</script>

<template>
  <div style="display: flex; flex-direction: column; max-width: 350px">
    <button @click="usersBulkUpdater.update()">
      Update
    </button>

    <button @click="updateWithStandardErrors()">
      Update with standard errors
    </button>

    <button @click="updateWithValidationErrors()">
      Update with validation errors
    </button>

    <UpdateUsersForms v-model="usersBulkUpdater.forms.value" />

    <pre>{{ usersBulkUpdater.response.value }}</pre>
  </div>
</template>
