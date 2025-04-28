export function getArrayExtraStrings (arrayA: string[], arrayB: string[]): string[] {
  const setB = new Set(arrayB)
  return arrayA.filter(item => !setB.has(item))
}
