<script lang="ts" setup>
import { useUpdater } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const tab = ref('record')
const postId = ref('1')
const postUpdater = useUpdater(Post, {
  id: postId,
  immediatelyMakeForm: true,
})
</script>

<template>
  <div class="q-pa-md q-gutter-y-md">
    <div class="q-gutter-y-md">
      <q-input
        v-model="postId"
        label="Post ID"
        filled
      />

      <q-input
        v-model="postUpdater.form.value.title"
        label="Title"
        filled
      />

      <q-btn
        label="Update"
        color="primary"
        unelevated
        :loading="!!postUpdater.updating.value"
        @click="postUpdater.update()"
      />
    </div>

    <q-card
      v-if="postUpdater.response.value"
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
        animated
        style="min-height: 285px;"
      >
        <q-tab-panel name="record">
          <pre
            v-if="postUpdater.record.value"
            style="max-height: 400px"
          >{{ postUpdater.record.value }}</pre>
        </q-tab-panel>
        <q-tab-panel name="response">
          <pre
            v-if="postUpdater.response.value"
            style="max-height: 400px"
          >{{ postUpdater.response.value }}</pre>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>
