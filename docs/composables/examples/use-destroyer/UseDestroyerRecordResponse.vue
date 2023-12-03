<script lang="ts" setup>
import { useDestroyer } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const tab = ref('record')
const postId = ref('1')
const postDestroyer = useDestroyer(Post, { id: postId })
</script>

<template>
  <div class="q-pa-md q-gutter-y-md">
    <q-input
      v-model="postId"
      dense
      filled
    />

    <q-btn
      label="destroy"
      color="primary"
      unelevated
      :loading="!!postDestroyer.destroying.value"
      @click="postDestroyer.destroy()"
    />

    <q-card
      v-if="postDestroyer.response.value"
      flat
      bordered
    >
      <q-tabs
        v-model="tab"
        align="left"
        dense
        active-bg-color="secondary"
        active-color="white"
      >
        <q-tab
          name="record"
          label="record"
        />
        <q-tab
          name="response"
          label="response"
        />
      </q-tabs>

      <q-tab-panels
        v-model="tab"
        style="min-height: 285px;"
      >
        <q-tab-panel name="record">
          <pre
            v-if="postDestroyer.record.value"
            style="max-height: 400px"
          >{{ postDestroyer.record.value }}</pre>
        </q-tab-panel>

        <q-tab-panel name="response">
          <pre
            v-if="postDestroyer.response.value"
            style="max-height: 400px"
          >{{ postDestroyer.response.value }}</pre>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>
