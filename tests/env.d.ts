/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly IMPLEMENTATION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
