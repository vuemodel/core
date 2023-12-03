<script lang="ts" setup>
import { getHighlighter } from 'shiki'
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  content: string
  lang?: 'vue' | 'json'
}>(), {
  lang: 'vue',
})

const contentHighlighted = ref('')

async function highlightExample () {
  getHighlighter({
    theme: 'material-theme-palenight',
    langs: ['vue', 'json'],
  }).then(highlighter => {
    contentHighlighted.value = highlighter.codeToHtml(props.content, { lang: props.lang })
  })
}

watch(() => props.content, () => {
  highlightExample()
}, { immediate: true })
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
  <code
    v-else
    class="highlighted-code"
    v-html="contentHighlighted"
  />
</template>

<style>
.highlighted-code {
  padding: 0 !important;
  display: block;
  overflow: auto;
}

.highlighted-code pre {
  padding: 8px;
  margin: 0px;
  height: auto;
  overflow: auto;
}
</style>
