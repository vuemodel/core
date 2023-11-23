<script lang="ts" setup>
import { ref } from 'vue'
import { FindResponse } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { Item } from 'pinia-orm'

interface Props {
  name: string
  response: FindResponse<typeof Post> | undefined
  record: Item<Post>
  finding: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  find: [],
  cancel: []
}>()

const findTab = ref<'record' | 'response'>('record')
const id = defineModel<string>('id', { required: true })
const withs = defineModel<string[]>('withs', { required: true })
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

      <q-select
        v-model="withs"
        label="With"
        dense
        filled
        multiple
        input-debounce="0"
        class="q-mb-sm"
        use-chips
        :options="['comments', 'user', 'user.albums.photos']"
      />

      <div class="q-gutter-x-sm">
        <q-btn
          label="Find"
          color="primary"
          unelevated
          :loading="finding"
          @click="emit('find')"
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
        v-model="findTab"
        dense
        align="left"
      >
        <q-tab
          name="record"
          label="postFinder.record.value"
          no-caps
        />
        <q-tab
          name="response"
          label="postFinder.response.value"
          no-caps
        />
      </q-tabs>
      <q-tab-panels v-model="findTab">
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
