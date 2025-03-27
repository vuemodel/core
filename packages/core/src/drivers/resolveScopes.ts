import { Model } from 'pinia-orm'
import { UseIndexerOptions } from '../contracts/crud/index/UseIndexer'
import { PluginScope, vueModelState } from '../plugin/state'
import { deepmerge } from 'deepmerge-ts'
import { ObjectQueryScope } from '../types/ObjectQueryScope'
import { toValue } from 'vue'
import { difference } from '../utils/difference'

export function resolveScope (
  scope: [name: string, parameters: any] | string | { name: string, parameters: any },
): PluginScope {
  if (typeof scope === 'string') {
    return {
      name: scope,
      parameters: {},
    }
  } else if (Array.isArray(scope)) {
    return {
      name: scope[0],
      parameters: scope[1],
    }
  } else if (typeof scope === 'object') {
    return scope
  }

  throw new Error('could not resolve scope')
}

export function resolveScopes (
  ModelClass: typeof Model,
  driver: string | (() => string),
  entity: string,
  scopesToUse: UseIndexerOptions<typeof Model>['scopes'],
  options?: {
    withoutGlobalScopes?: UseIndexerOptions<typeof Model>['withoutGlobalScopes'],
    withoutEntityGlobalScopes?: UseIndexerOptions<typeof Model>['withoutEntityGlobalScopes']
  },
): ObjectQueryScope {
  const scopesToUseResolved = toValue(scopesToUse)
  const driverResolved = toValue(driver)

  const resolvedScopesToUse: PluginScope[] = []
  if (Array.isArray(scopesToUseResolved)) {
    scopesToUseResolved.forEach(scopeToUse => {
      resolvedScopesToUse.push(resolveScope(scopeToUse))
    })
  } else if (typeof scopesToUseResolved === 'object') {
    Object.entries(scopesToUseResolved).forEach(entry => {
      resolvedScopesToUse.push(resolveScope(entry))
    })
  }

  const globalScopes = vueModelState.config?.scopes ?? {}
  const entityScopes = vueModelState.config?.entityScopes?.[entity] ?? {}
  const driverGlobalScopes = vueModelState.drivers[driverResolved].config?.scopes ?? {}
  const driverEntityScopes = vueModelState.drivers[driverResolved].config?.entityScopes?.[entity] ?? {}

  const configuredScopes = deepmerge(globalScopes, entityScopes, driverGlobalScopes, driverEntityScopes)

  let appliedGlobalScopes = vueModelState.config?.globallyAppliedScopes ?? []
  let appliedEntityScopes = vueModelState.config?.globallyAppliedEntityScopes?.[entity] ?? []
  let appliedDriversGlobalScopes = vueModelState.drivers[driverResolved].config?.globallyAppliedScopes ?? []
  let appliedDriversEntityScopes = vueModelState.drivers[driverResolved].config?.globallyAppliedEntityScopes?.[entity] ?? []

  if (options?.withoutGlobalScopes) {
    appliedGlobalScopes = difference(appliedGlobalScopes, toValue(options.withoutGlobalScopes))
    appliedDriversGlobalScopes = difference(appliedDriversGlobalScopes, toValue(options.withoutGlobalScopes))
  }

  if (options?.withoutEntityGlobalScopes) {
    appliedEntityScopes = difference(appliedEntityScopes, toValue(options.withoutEntityGlobalScopes))
    appliedDriversEntityScopes = difference(appliedDriversEntityScopes, toValue(options.withoutEntityGlobalScopes))
  }

  console.log('appliedGlobalScopes', appliedGlobalScopes)

  const scopesToApply = [
    ...appliedGlobalScopes,
    ...appliedEntityScopes,
    ...appliedDriversGlobalScopes,
    ...appliedDriversEntityScopes,
    ...resolvedScopesToUse,
  ]

  const resolvedScopes: ObjectQueryScope[] = scopesToApply.map(scope => {
    if (typeof scope === 'string') {
      const configuredScope = configuredScopes[scope]
      if (typeof configuredScope === 'function') {
        return configuredScope({ ModelClass, entity, driver: driverResolved })
      } else {
        return configuredScope
      }
    } else if (typeof scope === 'object') {
      const configuredScope = configuredScopes[scope.name]
      if (typeof configuredScope === 'function') {
        const parametersResolved = typeof scope.parameters === 'function' ? scope.parameters() : scope.parameters
        return configuredScope({ ModelClass, entity, driver: driverResolved }, parametersResolved ?? undefined)
      } else {
        return configuredScope
      }
    }

    throw new Error('could not resolve scope')
  })

  const result = (deepmerge(...resolvedScopes) ?? {}) as unknown as ObjectQueryScope

  return {
    filters: result.filters ?? {},
    orderBy: result.orderBy ?? [],
    with: result.with ?? {},
  }
}
