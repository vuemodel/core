import fs from 'fs'

const folders = [
  './src/models',
  './stubs',
]
const files = [
  './src/boot/vuemodel.ts',
  './src/boot/vuemodel.js',
]

folders.forEach((folder) => {
  if (fs.existsSync(folder)) {
    fs.rmSync(folder, { recursive: true })
  }
})
files.forEach((file) => {
  if (fs.existsSync(file)) {
    fs.rmSync(file, { recursive: true })
  }
})
