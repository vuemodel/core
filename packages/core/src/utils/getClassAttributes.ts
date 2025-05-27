import { Model, Relation, Type } from 'pinia-orm'
import { DeclassifyPiniaOrmModel } from '../types/DeclassifyPiniaOrmModel'
import { PiniaOrmDecoratorKind } from '../types/PiniaOrmDecoratorKind'
import { FilterPiniaOrmModelToRelationshipTypes } from '../types/FilterPiniaOrmModelToRelationshipTypes'

export function getClassAttributes<ModelType extends typeof Model> (
  PiniaOrmClass: ModelType,
) {
  const fields = (new PiniaOrmClass()).$fields()

  return Object.fromEntries(Object.entries(fields)
    .map(([key, schema]) => {
      const definition = {
        ...schema,
        kind: schema.constructor.name,
        isRelationship: schema instanceof Relation,
        key,
      }
      return [key, definition]
    })
    .filter(([_key, schema]) => typeof schema === 'object' ? !schema.isRelationship : false)) as Record<
    keyof Omit<DeclassifyPiniaOrmModel<InstanceType<ModelType>>, keyof FilterPiniaOrmModelToRelationshipTypes<InstanceType<ModelType>>>,
    Type & { kind: PiniaOrmDecoratorKind, isRelationship: boolean, key: string }
  >
}
