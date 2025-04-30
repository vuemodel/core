<script lang="ts" setup>
import importCode from './importCode.ts?raw'
import useCode from './useCode.ts?raw'
import headHTML from './headHTML.html?raw'
import defaultTsConfig from './defaultTsConfig.json?raw'
import { ReplStore, SFCOptions, Repl } from '@vue/repl'
import { defaultImports } from './defaultImports'
import { defaultReplContent } from './defaultReplContent'
import { EditorComponentType } from '@vue/repl/monaco-editor'
import { onMounted, ref, shallowRef } from 'vue'

const props = withDefaults(defineProps<{
  content: string
}>(), {
  content: defaultReplContent,
})

const store = new ReplStore({
  defaultVueRuntimeURL: `${location.origin}/src/vue-dev-proxy`,
})
store.state.typescriptVersion = '5.2.2'
store.setFiles({
  'src/App.vue': props.content,
  'tsconfig.json': defaultTsConfig,
}).then(() => {
// pre-set import map
  store.setImportMap({
    imports: defaultImports,
  })
})

const previewOptions = {
  headHTML,
  customCode: {
    importCode,
    useCode,
  },
}

const sfcOptions: SFCOptions = {
  script: {
    inlineTemplate: false,
    isProd: false,
    reactivityTransform: true,
    defineModel: true,
  },
  style: {
    isProd: false,
  },
  template: {
    isProd: false,
  },
}

const Monaco = shallowRef<EditorComponentType>()

onMounted(() => {
  import('@vue/repl/monaco-editor').then((module) => {
    Monaco.value = module.default
  })
})
</script>

<template>
  <q-spinner
    v-if="!Monaco"
    color="primary"
    class="q-pa-md"
    size="md"
  />

  <Repl
    v-else
    :editor="Monaco"
    :preview-options="previewOptions"
    :store="store"
    :show-compile-output="false"
    :auto-resize="true"
    :sfc-options="sfcOptions"
    :clear-console="false"
    @keydown.ctrl.s.prevent
    @keydown.meta.s.prevent
  />
</template>
