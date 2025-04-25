<script lang="ts" setup>
import { useBulkUpdater, useIndexer } from '@vuemodel/core'
import { populateRecords, Post, User } from '@vuemodel/sample-data'
import { deleteDatabases } from '@vuemodel/indexeddb'

async function resetData () {
  await deleteDatabases()
  await populateRecords('users', 1)
  await populateRecords('posts', 3)
  await init()
}

async function init () {
  await postsIndexer.index()
  await usersBulkUpdater.index()
  await usersBulkUpdater.makeForms()
}

const postsIndexer = useIndexer(Post)

const usersBulkUpdater = useBulkUpdater(User, {
  indexer: {
    with: {
      posts: {},
    },
  },
})

init()
</script>

<template>
  <div>
    <h1 style="flex: 0 0 100%;">
      Has Many Update
    </h1>

    <button @click="usersBulkUpdater.update()">
      Update
    </button>

    <button @click="resetData()">
      Reset Data
    </button>

    <q-card>
      <q-card-section>
        Forms
        <div
          v-for="form in usersBulkUpdater.forms.value"
          :key="form.id"
        >
          <q-input v-model="form.form.name" />
          <q-select
            v-model="form.form.posts"
            :options="postsIndexer.records.value"
            option-label="title"
            option-value="id"
            multiple
            map-options
            emit-value
          />
        </div>
      </q-card-section>
    </q-card>

    <q-card>
      <pre>{{ usersBulkUpdater.meta.value[1]?.changes }}</pre>
    </q-card>
  </div>
</template>

<style scoped>
label {
  display: flex;
  flex-direction: column;
}
</style>
