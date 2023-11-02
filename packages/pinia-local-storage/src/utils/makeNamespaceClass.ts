import { Model } from 'pinia-orm'

export function makeNamespaceClass<T extends typeof Model> (EntityClass: T) {
  return class EntityClassNamespaced extends EntityClass {
    static baseEntity = EntityClass.entity

    $namespace (): string {
      return 'pinia-orm-local-backend'
    }

    static fields () {
      return {
        ...super.schemas[super.entity],
      }
    }
  }
}
