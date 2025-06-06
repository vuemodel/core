import vueDevTools from 'vite-plugin-vue-devtools'

import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    vueDevTools(),
    quasar({
      sassVariables: fileURLToPath(
        new URL('./src/quasar-variables.sass', import.meta.url),
      ),
    }),
  ],
  optimizeDeps: {
    exclude: [
      '@vuemodel/core',
      '@vuemodel/sample-data',
      '@vuemodel/indexeddb'
    ],
  },
})
