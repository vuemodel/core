<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { routes } from './router'
import { computed } from 'vue'

function pascalToCamel (pascalStr: string): string {
  return pascalStr.charAt(0).toLowerCase() + pascalStr.slice(1)
}

const examples = routes.map(route => {
  return {
    link: route.path,
    label: pascalToCamel(route.path.replace('/', '')),
  }
})

const route = useRoute()
const router = useRouter()

const currentPage = computed(() => examples.find(example => example.link === route.path))
</script>

<template>
  <div style="margin-bottom: 32px">
    <button
      v-for="example in examples"
      :key="example.link"
      @click="router.push(example.link)"
    >
      {{ example.label }}
    </button>

    <hr>

    <h2>{{ currentPage?.label }}</h2>
  </div>

  <RouterView />
</template>
