<script lang="ts" setup>
import { ref } from 'vue'
import { IndexResponse, PaginationDetails } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { Collection } from 'pinia-orm'

interface Props {
  name: string
  response: IndexResponse<typeof Post> | undefined
  records: Collection<Post>
  indexing: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  index: []
  next: []
  previous: []
  cancel: []
}>()

const indexTab = ref<'records' | 'response'>('records')
const pagination = defineModel<PaginationDetails>('pagination', { required: true })
const withs = defineModel<string[]>('withs', { required: true })
</script>

<template>
  <q-tab-panel
    :name="name"
  >
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

    <q-card
      bordered
      flat
    >
      <q-card-section>
        <div class="text-body1 q-mb-xs">
          Pagination
        </div>

        <q-input
          v-model="pagination.recordsPerPage"
          filled
          dense
          label="recordsPerPage"
        />

        <div class="q-gutter-sm q-mt-xs">
          <q-btn
            unelevated
            size="sm"
            color="secondary"
            label="Previous"
            @click="emit('previous')"
          />
          <q-btn
            unelevated
            size="sm"
            color="secondary"
            label="Next"
            @click="emit('next')"
          />
        </div>
      </q-card-section>
    </q-card>

    <div class="q-gutter-y-md q-mt-sm">
      <q-btn
        label="Index"
        color="primary"
        unelevated
        :loading="indexing"
        @click="emit('index')"
      />
    </div>

    <!-- Result -->
    <q-card
      class="q-mt-md"
    >
      <q-tabs
        v-model="indexTab"
        dense
        align="left"
      >
        <q-tab
          name="records"
          label="postIndexer.records.value"
          no-caps
        />
        <q-tab
          name="response"
          label="postIndexer.response.value"
          no-caps
        />
      </q-tabs>
      <q-tab-panels v-model="indexTab">
        <q-tab-panel name="records">
          <pre>{{ records }}</pre>
        </q-tab-panel>

        <q-tab-panel name="response">
          <pre>{{ response }}</pre>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-tab-panel>
</template>
