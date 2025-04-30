import { IndexWithsLoose } from '../contracts/crud/index/IndexWithsLoose'

function createNestedObject (paths: string[]): IndexWithsLoose {
  const result: IndexWithsLoose = {}

  for (const path of paths) {
    let currentLevel = result
    const keys = path.split('.')

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]

      if (!currentLevel[key]) {
        currentLevel[key] = {}
      }

      currentLevel = currentLevel[key] as any
    }
  }

  return result
}

export function makeWithQuery (
  withRaw: string | string[] | IndexWithsLoose,
): IndexWithsLoose {
  let result: IndexWithsLoose = {}

  if (typeof withRaw === 'string') {
    const withSplit = withRaw.split(',')
    result = createNestedObject(withSplit)
  } else if (Array.isArray(withRaw)) {
    result = createNestedObject(withRaw)
  } else if (typeof withRaw === 'object') {
    result = withRaw
  }

  return result
}
