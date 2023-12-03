<script lang="ts" setup>
import { useFinder } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const tab = ref('record')
const postId = ref('1')
const postFinder = useFinder(Post, { id: postId })
</script>

<template>
  <div class="q-pa-md q-gutter-y-md">
    <q-input
      v-model="postId"
      dense
      filled
    />

    <q-btn
      label="find"
      color="primary"
      unelevated
      :loading="!!postFinder.finding.value"
      @click="postFinder.find()"
    />

    <q-card
      v-if="postFinder.response.value"
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
            v-if="postFinder.record.value"
            style="max-height: 400px"
          >{{ postFinder.record.value }}</pre>
        </q-tab-panel>

        <q-tab-panel name="response">
          <pre
            v-if="postFinder.response.value"
            style="max-height: 400px"
          >{{ postFinder.response.value }}</pre>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>
