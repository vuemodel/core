import Model from "types/Model"
import { ComputedRef, Ref } from 'vue-demi'

// type createResourceRequestData = Record<string, unknown>

interface UseCreateResourceRequestReturn<M> {
  create: () => Promise<void>
  creating: ComputedRef<boolean>
  form: Ref<Partial<M>>
}

type UseCreateResourceRequest<M extends Model> = (modelClass: Model) => UseCreateResourceRequestReturn<M>

export {
  UseCreateResourceRequestReturn,
  UseCreateResourceRequest
}