<script lang="ts" setup>
import { ref } from 'vue'
import { UpdateResponse, Form } from '@vuemodel/core'
import { Post, User } from '@vuemodel/sample-data'
import { Collection, Item } from 'pinia-orm'
import PostForm from './PostForm.vue'

interface Props {
  name: string
  response: UpdateResponse<typeof Post> | undefined
  record: Item<Post>
  updating: boolean
  users: Collection<User>
}

defineProps<Props>()
const emit = defineEmits<{
  update: [],
  cancel: []
}>()

const updateTab = ref<'record' | 'response'>('record')
const id = defineModel<string>('id', { required: true })
const form = defineModel<Form<Post>>('form', { required: true })
const autoUpdate = defineModel<boolean>('autoUpdate', { required: true })
const autoUpdateDebounce = defineModel<number>('autoUpdateDebounce', { required: true })
</script>

<template>
  <q-tab-panel
    :name="name"
  >
    <div class="q-gutter-y-md">
      <div class="row q-gutter-x-md">
        <q-checkbox
          v-model="autoUpdate"
          label="Auto Update"
        />
        <q-input
          v-if="autoUpdate"
          v-model.number="autoUpdateDebounce"
          type="number"
          label="Auto Update Debounce (ms)"
          filled
          dense
        />
      </div>

      <q-input
        v-model="id"
        label="ID"
        dense
        filled
      />

      <PostForm
        v-model="form"
        :users="users"
      />

      <div class="q-gutter-x-sm">
        <q-btn
          label="Update"
          color="primary"
          unelevated
          :loading="updating"
          @click="emit('update')"
        />
        <q-btn
          label="Cancel"
          unelevated
          @click="emit('cancel')"
        />
      </div>
    </div>

    <!-- Result -->
    <q-card
      class="q-mt-md"
    >
      <q-tabs
        v-model="updateTab"
        dense
        align="left"
      >
        <q-tab
          name="record"
          label="postUpdateer.record.value"
          no-caps
        />
        <q-tab
          name="response"
          label="postUpdateer.response.value"
          no-caps
        />
      </q-tabs>
      <q-tab-panels v-model="updateTab">
        <q-tab-panel name="record">
          <pre>{{ record }}</pre>
        </q-tab-panel>

        <q-tab-panel name="response">
          <pre>{{ response }}</pre>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-tab-panel>
</template>
