<script lang="ts" setup>
import '@vue/repl/style.css'
import { defaultReplContent } from '../VueRepl/defaultReplContent'
import { type Component, ref } from 'vue'
import { mdiAlphaRBox, mdiCodeTags } from '@quasar/extras/mdi-v7'
import ReplDialog from '../ReplDialog/ReplDialog.vue'
import ResetDataButton from '../ResetDataButton/ResetDataButton.vue'

withDefaults(defineProps<{
  content: string
  title: string
  exampleComponent: Component
}>(), {
  content: defaultReplContent,
})

const showReplDialog = ref(false)
const showCode = ref(false)
</script>

<template>
  <q-card
    square
    flat
    bordered
    class="q-mt-lg"
  >
    <q-toolbar style="border-bottom: 1px solid rgb(212, 212, 212)">
      <q-toolbar-title>{{ title }}</q-toolbar-title>

      <q-btn
        round
        flat
        :icon="mdiAlphaRBox"
        @click="showReplDialog = true"
      />

      <q-btn
        round
        flat
        :icon="mdiCodeTags"
        @click="showCode = !showCode"
      />

      <ResetDataButton />
    </q-toolbar>

    <HighlightedCode
      v-if="showCode"
      :content="content"
    />

    <div class="example-component-wrapper">
      <ClientOnly>
        <component :is="exampleComponent" />
      </ClientOnly>
    </div>

    <ReplDialog
      v-model="showReplDialog"
      :content="content"
    />
  </q-card>
</template>

<style>
.example-component-wrapper pre {
  background: #303030;
  color: rgb(213, 213, 213);
  border-radius: 4px;
  padding: 4px;
  overflow: auto;
}
</style>
