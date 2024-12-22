<script lang="ts" setup>
import { useBulkUpdater, useCreator, useDestroyer, useIndexer, useUpdater } from '@vuemodel/core'
import { populateRecords, User } from '@vuemodel/sample-data'
import { clear } from 'idb-keyval'
import { reactive, ref } from 'vue'
import UpdateUsersForms from './UpdateUsersForms.vue'

const usersIndexer = useIndexer(User)

async function resetUserData () {
  await clear()
  await populateRecords('users')
  usersIndexer.index()
}

async function makeForms () {
  await usersIndexer.index()
  await usersBulkUpdater.makeForms()
}

const usersBulkUpdater = reactive(useBulkUpdater(User, {
  excludeFields: ['tenant_id', 'age'],
  autoUpdate: true,
}))

const userCreator = reactive(useCreator(User))

const userId = ref('1')
const userUpdater = reactive(useUpdater(User, { id: userId }))

const userDestroyer = useDestroyer(User, { id: userId })
</script>

<template>
  <div>
    <h1 style="flex: 0 0 100%;">
      Update
    </h1>

    <button @click="resetUserData()">
      Reset User Data
    </button>

    <button @click="makeForms()">
      Make Forms
    </button>

    <button @click="usersBulkUpdater.update()">
      Update
    </button>

    <div style="display: flex; flex-direction: column; max-width: 350px">
      <h2>Create User Form</h2>

      <label for="form-id">ID</label>
      <input
        id="form-id"
        v-model="userCreator.form.id"
      >

      <label for="form-title">Name</label>
      <input
        id="form-title"
        v-model="userCreator.form.name"
      >

      <button
        style="margin-top: 8px"
        :disabled="userCreator.creating"
        @click="userCreator.create()"
      >
        Create
      </button>
    </div>

    <div class="q-pa-md q-gutter-y-md">
      <h2>Update User</h2>

      <input
        v-model="userId"
        label="User ID"
        filled
      >

      <button
        no-caps
        color="primary"
        unelevated
        :loading="!!userUpdater.makingForm"
        @click="userUpdater.makeForm()"
      >
        Make Form
      </button>

      <input
        v-model="userUpdater.form.name"
        label="Title"
        filled
      >

      <button
        color="primary"
        unelevated
        :loading="!!userUpdater.updating"
        @click="userUpdater.update()"
      >
        Update
      </button>

      <button @click="userDestroyer.destroy()">
        Destroy
      </button>
    </div>

    <UpdateUsersForms v-model="usersBulkUpdater.forms" />
  </div>
</template>

<style scoped>
label {
  display: flex;
  flex-direction: column;
}

input {
  outline: none;
}
</style>
