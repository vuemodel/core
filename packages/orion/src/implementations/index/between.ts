type RangeValue = string | number | Date;

function isNumeric (str: string) {
  if (typeof str !== 'string') return false // we only process strings!
  return !isNaN(str as any) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function toComparable (value: RangeValue, targetType?: 'string' | 'number' | 'date'): number | string {
  if (typeof value === 'number') {
    if (targetType === 'string') return String(value)
    return value
  }

  if (value instanceof Date) {
    if (targetType === 'string') return value.toISOString()
    return value.getTime()
  }

  if (typeof value === 'string') {
    if (isNumeric(value)) {
      const parsedNumber = parseFloat(value)
      if (!isNaN(parsedNumber)) {
        if (targetType === 'string') return value
        return parsedNumber
      }
    }

    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      if (targetType === 'number') return date.getTime()
      if (targetType === 'date') return date.toDateString()
      return value
    }

    return value
  }

  throw new Error('Unsupported value type.')
}

export function between (value: RangeValue, range: [RangeValue, RangeValue]): boolean {
  const originalType = typeof value
  const comparableValue = toComparable(value)
  const valueType = ((originalType === 'string' && typeof comparableValue === 'number') ? 'number' : typeof comparableValue) as 'string' | 'number' | 'date' | undefined
  const comparableStart = toComparable(range[0], valueType)
  const comparableEnd = toComparable(range[1], valueType)

  // Ensure all values are of the same comparable type
  if (typeof comparableValue !== typeof comparableStart || typeof comparableValue !== typeof comparableEnd) {
    throw new Error('Inconsistent types after conversion.')
  }

  if (typeof comparableValue === 'number') {
    return comparableValue >= (comparableStart as number) && comparableValue <= (comparableEnd as number)
  } else if (typeof comparableValue === 'string') {
    return comparableValue.localeCompare(comparableStart as string) >= 0 && comparableValue.localeCompare(comparableEnd as string) <= 0
  }

  throw new Error('Unsupported comparable type.')
}
