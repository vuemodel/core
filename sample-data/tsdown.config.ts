import { defineConfig } from 'tsdown/config'

export default defineConfig({
  entry: 'src/index.ts',
  outDir: './dist',
  format: ['esm', 'cjs'],
  // target: 'ES2021',
})