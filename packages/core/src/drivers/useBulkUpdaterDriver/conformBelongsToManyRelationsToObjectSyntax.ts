import { Model } from 'pinia-orm'
import { getPivotModelIdField } from '../../utils/getPivotModelIdField'
import keyBy from 'just-index'

export function conformBelongsToManyRelationsToObjectSyntax (
  record: Record<string, any>,
  belongsToManyRelationshipKeys: string[],
  pivotClasses: Record<string, Model>,
  driver: string,
) {
  const result: Record<string, any> = {}
  // for each many field
  belongsToManyRelationshipKeys.forEach(manyKey => {
    // if the field is not an array, do nothing
    const PivotClass = pivotClasses[manyKey]
    if (!PivotClass) {
      result[manyKey] = record[manyKey]
    } else {
      const idField = getPivotModelIdField(PivotClass, { driver })
      result[manyKey] = keyBy(record[manyKey], idField)
    }
  })

  return result
}
