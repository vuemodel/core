<script lang="ts" setup>
import { useIndexer } from '@vuemodel/core'
import { User } from '@vuemodel/sample-data'
import { ref } from 'vue'

const whereIdIn = ref([])
const whereIdInImmediate = ref(false)
const ids = Array(20).fill(0).map((element, index) => String(index + 1))

const usersIndexer = useIndexer(User, { whereIdIn, whereIdInImmediate })
</script>

<template>
  <div class="q-pa-md">
    <div class="row justify-between items-center q-mb-sm">
      <q-btn
        label="Index"
        no-caps
        color="primary"
        @click="usersIndexer.index()"
      />

      <q-checkbox
        v-model="whereIdInImmediate"
        label="whereIdInImmediate"
        class="q-mb-sm"
        left-label
      />
    </div>

    <q-select
      v-model="whereIdIn"
      :options="ids"
      multiple
      use-chips
      filled
      color="secondary"
      dense
      class="q-mb-md"
    />

    <HighlightedCode
      v-if="usersIndexer.records.value.length"
      style="max-height: 400px"
      :content="JSON.stringify(usersIndexer.records.value, undefined, 2)"
      lang="json"
    />
  </div>
</template>
