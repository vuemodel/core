<script lang="ts" setup>
import { codeToHtml } from 'shiki'
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  content: string
  lang?: 'vue' | 'json'
}>(), {
  lang: 'vue',
})

const contentHighlighted = ref('')

async function highlightExample () {
  // const highlighter = await createHighlighter({
  //   themes: ['material-theme-palenight'],
  //   langs: ['vue', 'json'],
  // })
  contentHighlighted.value = await codeToHtml(props.content, {
    lang: props.lang,
    theme: 'nord',
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
