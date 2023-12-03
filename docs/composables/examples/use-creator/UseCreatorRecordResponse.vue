<script lang="ts" setup>
import { useCreator } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const tab = ref('record')
const postCreator = useCreator(Post)
</script>

<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md q-mb-md">
      <q-input
        v-model="postCreator.form.value.title"
        label="Title"
        filled
      />
      <q-btn
        label="Create"
        color="primary"
        unelevated
        @click="postCreator.create()"
      />
    </div>

    <q-card
      v-if="postCreator.response.value"
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
            v-if="postCreator.record.value"
            style="max-height: 400px"
          >{{ postCreator.record.value }}</pre>
        </q-tab-panel>
        <q-tab-panel name="response">
          <pre
            v-if="postCreator.response.value"
            style="max-height: 400px"
          >{{ postCreator.response.value }}</pre>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>
