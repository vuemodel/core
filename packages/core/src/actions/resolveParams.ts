export function resolveParams (...params: any[]) {
  if (typeof params[0] === 'string') {
    return params.slice(1)
  }

  return params
}
