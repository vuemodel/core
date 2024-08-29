<script lang="ts" setup>
import { useLocalStorage } from '@vueuse/core'

const exampleComponents = Object.entries(
  import.meta.glob('./examples/BatchUpdate*.vue', { eager: true }),
)

const tab = useLocalStorage('UseBatchUpdater.tab', '')
</script>

<template>
  <div style="display: flex; flex-direction: column; max-width: 900px;">
    <div style="display: flex; flex-direction: row;">
      <button
        v-for="exampleComponent in exampleComponents"
        :key="exampleComponent[0]"
        :style="`background-color: ${exampleComponent[0] === tab ? 'grey' : undefined};`"
        @click="tab = exampleComponent[0]"
      >
        {{ exampleComponent[0].replace('./examples/BatchUpdate', '').replace('.vue', '') }}
      </button>
    </div>

    <div
      v-for="exampleComponent in exampleComponents"
      :key="exampleComponent[0]"
    >
      <component
        :is="exampleComponent[1].default"
        v-if="tab === exampleComponent[0]"
      />
    </div>
  </div>
</template>

<style scoped>
h1 {
  margin: 0;
}
</style>
