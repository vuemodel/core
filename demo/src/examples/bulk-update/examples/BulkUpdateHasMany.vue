<script lang="ts" setup>
import { useBulkUpdater, useCreator, useDestroyer, useIndexer } from '@vuemodel/core'
import { populateRecords, Post, User } from '@vuemodel/sample-data'
import { deleteDatabases } from '@vuemodel/indexeddb'
import { mdiDelete } from '@quasar/extras/mdi-v7'
import { useLocalStorage } from '@vueuse/core'

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
const userDestroyer = useDestroyer(User)
const userCreator = useCreator(User, {
  onSuccess (response) {
    usersBulkUpdater.currentPageIds.value.push(response.record.id)
  },
})
const postDestroyer = useDestroyer(Post)

const usersAutoUpdate = useLocalStorage('BulkUpdateHasMany.usersAutoUpdate', false)
const usersAutoUpdateDebounce = useLocalStorage('BulkUpdateHasMany.usersAutoUpdateDebounce', 350)
const usersBulkUpdater = useBulkUpdater(User, {
  autoUpdate: usersAutoUpdate,
  autoUpdateDebounce: () => Number(usersAutoUpdateDebounce.value),
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
  <div
    class="q-pa-md"
    style="width: 100vw"
  >
    <div class="q-col-gutter-md row full-width">
      <div class="col-12 col-sm-3">
        <q-card>
          <q-toolbar class="bg-blue-grey-8 text-white">
            <q-toolbar-title>Actions</q-toolbar-title>
          </q-toolbar>
          <q-card-section>
            <div class="q-gutter-md">
              <q-btn @click="usersBulkUpdater.update()">
                Update
              </q-btn>
              <q-btn @click="resetData()">
                Reset Data
              </q-btn>
              <q-btn @click="usersBulkUpdater.makeForms()">
                Make Forms
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-3">
        <q-card>
          <q-toolbar class="bg-negative text-white">
            <q-toolbar-title>Delete Post</q-toolbar-title>
          </q-toolbar>
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
      </div>

      <div class="col-12 col-sm-3">
        <q-card>
          <q-toolbar class="bg-primary text-white">
            <q-toolbar-title>Create Post</q-toolbar-title>
          </q-toolbar>
          <q-card-section>
            <q-form class="q-gutter-sm">
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
                use-chips
                label="User"
              />
              <q-btn
                :loading="postCreator.creating.value"
                label="Create"
                @click="postCreator.create()"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-3">
        <q-card>
          <q-toolbar class="bg-primary text-white">
            <q-toolbar-title>Create User</q-toolbar-title>
          </q-toolbar>
          <q-card-section>
            <q-form class="q-gutter-sm">
              <q-input
                v-model="userCreator.form.value.name"
                label="Name"
                filled
              />
              <q-btn
                :loading="userCreator.creating.value"
                label="Create"
                @click="userCreator.create()"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card>
          <q-toolbar class="bg-blue-grey-2">
            <q-toolbar-title>
              User Forms
            </q-toolbar-title>

            <q-toggle
              v-model="usersAutoUpdate"
              label="Auto Update"
              class="q-mr-sm"
            />

            <q-input
              v-model.number="usersAutoUpdateDebounce"
              dense
              filled
              bg-color="white"
              label="Auto Update Debounce"
            />
          </q-toolbar>
          <q-card-section class="row q-col-gutter-md">
            <div
              v-for="form in usersBulkUpdater.forms.value"
              :key="form.id"
              class="col-12 col-sm-4"
            >
              <q-card
                bordered
                flat
              >
                <q-card-section class="q-gutter-md">
                  <q-input
                    v-model="form.form.name"
                    filled
                  />

                  <q-select
                    v-model="form.form.posts"
                    use-chips
                    filled
                    label="Post"
                    :options="postsIndexer.repo.all()"
                    option-label="title"
                    option-value="id"
                    multiple
                    map-options
                    emit-value
                  />

                  <q-btn
                    :icon="mdiDelete"
                    flat
                    round
                    size="sm"
                    @click="userDestroyer.destroy(form.id)"
                  />
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <q-card>
        <pre>{{ usersBulkUpdater.meta.value[1]?.changes }}</pre>
      </q-card>
    </div>
  </div>
</template>

<style scoped>
label {
  display: flex;
  flex-direction: column;
}
</style>
