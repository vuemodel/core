<script lang="ts" setup>
import { useBulkUpdater, useCreator, useDestroyer, useIndexer } from '@vuemodel/core'
import { populateRecords, Post, User } from '@vuemodel/sample-data'
import { deleteDatabases } from '@vuemodel/indexeddb'

async function resetData () {
  await deleteDatabases()
  await populateRecords('users', 2)
  await populateRecords('posts', 3)
  await init()
}

async function init () {
  await postsIndexer.index()
  await usersBulkUpdater.index()
  await usersIndexer.index()
  await usersBulkUpdater.makeForms()
}

const postsIndexer = useIndexer(Post)
const usersIndexer = useIndexer(User)
const postDestroyer = useDestroyer(Post)

const usersBulkUpdater = useBulkUpdater(User, {
  indexer: {
    with: {
      posts: {},
    },
  },
})

const postCreator = useCreator(Post)

init()
</script>

<template>
  <div class="q-gutter-lg">
    <h1 style="flex: 0 0 100%;">
      Has Many Update
    </h1>

    <q-card>
      <q-card-section class="q-gutter-md">
        <q-btn @click="usersBulkUpdater.update()">
          Update
        </q-btn>
        <q-btn @click="resetData()">
          Reset Data
        </q-btn>
        <q-btn @click="usersBulkUpdater.makeForms()">
          Make Forms
        </q-btn>
      </q-card-section>
    </q-card>

    <q-card>
      Delete
      <q-card-section class="q-gutter-md">
        <q-btn
          v-for="post in postsIndexer.repo.all()"
          :key="post.id"
          :label="post.title"
          :loading="post.id === postDestroyer.destroying.value"
          @click="postDestroyer.destroy(post.id)"
        />
      </q-card-section>
    </q-card>

    <q-card>
      <q-card-section>
        <q-input
          v-model="postCreator.form.value.title"
          label="Post Title"
          filled
        />

        <q-select
          v-model="postCreator.form.value.user_id"
          filled
          :options="usersIndexer.records.value"
          option-label="name"
          option-value="id"
          emit-value
          map-options
          label="User"
        />

        <q-btn
          :loading="postCreator.creating.value"
          label="Create"
          @click="postCreator.create()"
        />
      </q-card-section>
    </q-card>

    Forms
    <q-card
      v-for="form in usersBulkUpdater.forms.value"
      :key="form.id"
    >
      <q-card-section>
        <div>
          <q-input
            v-model="form.form.name"
            filled
          />
          <q-select
            v-model="form.form.posts"
            filled
            label="Post"
            :options="postsIndexer.repo.all()"
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
