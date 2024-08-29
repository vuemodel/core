import { OrionScope } from '../../extensions/AddScopeTypes'

export function applyScopes (
  query: any,
  orionScopes: OrionScope[] | undefined,
) {
  if (!Array.isArray(orionScopes) || !orionScopes) return

  query.scopes = orionScopes
}
