<script lang="ts" setup>
import { ref } from 'vue'
import { CreateResponse, Form } from '@vuemodel/core'
import { Post, User } from '@vuemodel/sample-data'
import { Collection, Item } from 'pinia-orm'
import PostForm from './PostForm.vue'

interface Props {
  name: string
  response: CreateResponse<typeof Post> | undefined
  record: Item<Post>
  creating: boolean
  users: Collection<User>
}

defineProps<Props>()
const emit = defineEmits<{
  create: [],
  cancel: []
}>()

const createTab = ref<'record' | 'response'>('record')
const form = defineModel<Form<Post>>('form', { default: {} })
</script>

<template>
  <q-tab-panel
    :name="name"
  >
    <div class="q-gutter-y-md">
      <PostForm
        v-model="form"
        :users="users"
      />

      <div class="q-gutter-x-sm">
        <q-btn
          label="Create"
          color="primary"
          unelevated
          :loading="creating"
          @click="emit('create')"
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
        v-model="createTab"
        dense
        align="left"
      >
        <q-tab
          name="record"
          label="postCreator.record.value"
          no-caps
        />
        <q-tab
          name="response"
          label="postCreator.response.value"
          no-caps
        />
      </q-tabs>
      <q-tab-panels v-model="createTab">
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
