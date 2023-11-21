<script lang="ts" setup>
import { getHighlighter } from 'shiki'
import { ref } from 'vue'

const props = defineProps<{
  content: string
}>()

const contentHighlighted = ref('')

async function highlightExample () {
  getHighlighter({
    theme: 'material-theme-palenight',
    langs: ['vue'],
  }).then(highlighter => {
    contentHighlighted.value = highlighter.codeToHtml(props.content, { lang: 'vue' })
  })
}

highlightExample()
</script>

<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    v-if="!contentHighlighted"
    class="flex flex-center q-pa-md"
  >
    <q-spinner
      size="md"
      color="primary"
    />
  </div>
  <pre
    v-else
    class="highlighted-code q-mt-none"
  ><code
    v-html="contentHighlighted"
  /></pre>
</template>

<style>
.highlighted-code pre {
  padding: 18px;
  margin: 0px;
}
</style>
