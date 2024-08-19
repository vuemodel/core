import { Model } from 'pinia-orm'
import { MaybeRefOrGetter } from 'vue'

export interface OrionScope {
  name: string
  parameters: any[]
}

// Extending the existing UseIndexerOptions interface
declare module '@vuemodel/core' {
  interface UseIndexerOptions<T extends typeof Model> {
    orionScopes?: MaybeRefOrGetter<OrionScope[]>
  }

  interface IndexOptions<T extends typeof Model> {
    orionScopes?: OrionScope[]
  }
}
