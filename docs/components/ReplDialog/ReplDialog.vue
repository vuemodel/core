<script lang="ts" setup>
import VueRepl from '../VueRepl/VueRepl.vue'
import { mdiClose } from '@quasar/extras/mdi-v7'
import { useVModel } from '@vueuse/core'

const props = defineProps<{
  modelValue: boolean
  content: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const showReplDialog = useVModel(props, 'modelValue', emit)
</script>

<template>
  <q-dialog
    v-if="showReplDialog"
    v-model="showReplDialog"
    transition-duration="0"
    maximized
  >
    <div>
      <VueRepl
        v-if="showReplDialog"
        :content="content"
      />

      <q-btn
        v-close-popup
        style="z-index: 1"
        class="absolute-top-right q-mt-xs q-mr-xs"
        size="sm"
        round
        flat
        :icon="mdiClose"
      />
    </div>
  </q-dialog>
</template>
