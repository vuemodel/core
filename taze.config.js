import { defineConfig } from 'taze'

export default defineConfig({
  recursive: true,
  force: true,
  install: true,
  packageMode: {
    typescript: 'major',
  },
})
