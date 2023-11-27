<script lang="ts" setup>
import { useCreator, useDestroyer, useFinder, useIndexer, useUpdater } from '@vuemodel/core'
import { Post, User } from '@vuemodel/sample-data'
import { ref } from 'vue'
import CreatePanel from './CreatePanel.vue'
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage'
import IndexPanel from './IndexPanel.vue'
import FindPanel from './FindPanel.vue'
import UpdatePanel from './UpdatePanel.vue'
import DestroyPanel from './DestroyPanel.vue'

const optimistic = ref(false)
const persist = ref(true)

const withs = ref<string[]>([])

// Creator
const postCreator = useCreator(Post, { optimistic, persist })

// Indexer
const postsIndexer = useIndexer(Post, {
  persist,
  pagination: { recordsPerPage: 3 },
  with: withs,
})

// Finder
const targetId = ref('1')
const postFinder = useFinder(Post, { persist, id: targetId, with: withs })

// Updater
const autoUpdateDebounce = ref(200)
const autoUpdate = ref(false)
const postUpdater = useUpdater(Post, {
  optimistic,
  persist,
  immediatelyMakeForm: true,
  id: targetId,
  autoUpdate,
  autoUpdateDebounce,
})

// Destroyer
const postDestroyer = useDestroyer(Post, {
  optimistic,
  persist,
})

const usersIndexer = useIndexer(User, { immediate: true })

type Tab = 'postCreator' | 'postsIndexer' | 'postFinder' | 'postUpdater' | 'postDestroyer'
const tab = ref<Tab>()

const mockLatencyMs = ref(0)
</script>

<template>
  <div class="q-pa-md">
    <div class="row q-gutter-sm">
      <q-input
        v-model="mockLatencyMs"
        label="mock latency (ms)"
        filled
        dense
        type="number"
        style="max-width: 150px"
        @update:model-value="() => piniaLocalStorageState.mockLatencyMs = mockLatencyMs"
      />
      <q-checkbox
        v-model="optimistic"
        label="optimistic"
      />
    </div>

    <q-card
      flat
      bordered
      class="q-mt-md"
    >
      <q-tabs
        v-model="tab"
        dense
        align="left"
        active-bg-color="primary"
        active-class="text-white"
        indicator-color="grey-8"
      >
        <q-tab
          label="create"
          name="postCreator"
        />
        <q-tab
          label="index"
          name="postsIndexer"
        />
        <q-tab
          label="find"
          name="postFinder"
        />
        <q-tab
          label="update"
          name="postUpdater"
        />
        <q-tab
          label="destroy"
          name="postDestroyer"
        />
      </q-tabs>

      <q-tab-panels v-model="tab">
        <!-- Create -->
        <CreatePanel
          v-model:form="postCreator.form.value"
          name="postCreator"
          :response="postCreator.response.value"
          :record="postCreator.record.value"
          :creating="postCreator.creating.value"
          :users="usersIndexer.records.value"
          @create="postCreator.create()"
          @cancel="postCreator.cancel()"
        />

        <!-- Index -->
        <IndexPanel
          v-model:withs="withs"
          v-model:pagination="postsIndexer.pagination.value"
          name="postsIndexer"
          :response="postsIndexer.response.value"
          :records="postsIndexer.records.value"
          :indexing="postsIndexer.indexing.value"
          @index="postsIndexer.index()"
          @next="postsIndexer.next()"
          @previous="postsIndexer.previous()"
          @cancel="postsIndexer.cancel()"
        />

        <!-- Find -->
        <FindPanel
          v-model:id="targetId"
          v-model:withs="withs"
          name="postFinder"
          :response="postFinder.response.value"
          :record="postFinder.record.value"
          :finding="!!postFinder.finding.value"
          @find="postFinder.find()"
          @cancel="postFinder.cancel()"
        />

        <!-- Update -->
        <UpdatePanel
          v-model:id="targetId"
          v-model:withs="withs"
          v-model:form="postUpdater.form.value"
          v-model:autoUpdate="autoUpdate"
          v-model:autoUpdateDebounce="autoUpdateDebounce"
          :users="usersIndexer.records.value"
          name="postUpdater"
          :response="postUpdater.response.value"
          :record="postUpdater.record.value"
          :updating="!!postUpdater.updating.value"
          @update="() => {
            console.log('will update')
            console.log(postUpdater.form.value)
            postUpdater.update()
          }"
          @cancel="postUpdater.cancel()"
        />

        <!-- Destroy -->
        <DestroyPanel
          v-model:id="targetId"
          name="postDestroyer"
          :response="postDestroyer.response.value"
          :record="postDestroyer.record.value"
          :destroying="!!postDestroyer.destroying.value"
          @destroy="postDestroyer.destroy(targetId)"
          @cancel="postDestroyer.cancel()"
        />
      </q-tab-panels>
    </q-card>
  </div>
</template>
