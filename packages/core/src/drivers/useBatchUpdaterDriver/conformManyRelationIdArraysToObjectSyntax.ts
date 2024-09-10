export function conformManyRelationIdArraysToObjectSyntax (
  record: Record<string, any>,
  manyRelationshipKeys: string[],
) {
  const result: Record<string, any> = {}
  // for each many field
  manyRelationshipKeys.forEach(manyKey => {
    // if the field is not an array, do nothing
    if (!Array.isArray(record[manyKey])) {
      result[manyKey] = record[manyKey]
    } else {
      result[manyKey] = Object.fromEntries(
        record[manyKey].map(id => [id, {}]),
      )
    }
  })

  return result
}
