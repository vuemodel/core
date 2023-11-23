<script lang="ts" setup>
import { ref } from 'vue'
import { DestroyResponse } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { Item } from 'pinia-orm'

interface Props {
  name: string
  response: DestroyResponse<typeof Post> | undefined
  record: Item<Post>
  destroying: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  destroy: [],
  cancel: []
}>()

const destroyTab = ref<'record' | 'response'>('record')
const id = defineModel<string>('id', { required: true })
</script>

<template>
  <q-tab-panel
    :name="name"
  >
    <div class="q-gutter-y-md">
      <q-input
        v-model="id"
        label="ID"
        filled
        dense
      />

      <div class="q-gutter-x-sm">
        <q-btn
          label="Destroy"
          color="primary"
          unelevated
          :loading="destroying"
          @click="emit('destroy')"
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
        v-model="destroyTab"
        dense
        align="left"
      >
        <q-tab
          name="record"
          label="postDestroyer.record.value"
          no-caps
        />
        <q-tab
          name="response"
          label="postDestroyer.response.value"
          no-caps
        />
      </q-tabs>
      <q-tab-panels v-model="destroyTab">
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
