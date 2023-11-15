import { Model } from 'pinia-orm'
import { UseIndexResourcesOptions } from '../contracts/crud/index/UseIndexResources'
import { PluginScope, PluginScopeConfig, vueModelState } from '../plugin/state'
import deepmerge from 'deepmerge'
import { ObjectQueryScope } from '../types/ObjectQueryScope'
import { toValue } from 'vue'
import { difference } from '../utils/difference'

export function resolveScope (
  scope: [name: string, paramaters: any] | string | { name: string, paramaters: any },
): PluginScope {
  if (typeof scope === 'string') {
    return {
      name: scope,
      paramaters: {},
    }
  } else if (Array.isArray(scope)) {
    return {
      name: scope[0],
      paramaters: scope[1],
    }
  } else if (typeof scope === 'object') {
    return scope
  }

  throw new Error('could not resolve scope')
}

export function resolveScopes (
  driver: string,
  entity: string,
  scopesToUse: UseIndexResourcesOptions<typeof Model>['scopes'],
  options?: {
    withoutGlobalScopes: UseIndexResourcesOptions<typeof Model>['withoutGlobalScopes'],
    withoutEntityGlobalScopes: UseIndexResourcesOptions<typeof Model>['withoutEntityGlobalScopes']
  },
): ObjectQueryScope {
  const scopesToUseResolved = toValue(scopesToUse)

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
  const driverGlobalScopes = vueModelState.drivers[driver].config?.scopes ?? {}
  const driverEntityScopes = vueModelState.drivers[driver].config?.entityScopes?.[entity] ?? {}

  const configuredScopes = deepmerge.all<Record<string, PluginScopeConfig>>([globalScopes, entityScopes, driverGlobalScopes, driverEntityScopes])

  let appliedGlobalScopes = vueModelState.config?.globallyAppliedScopes ?? []
  let appliedEntityScopes = vueModelState.config?.globallyAppliedEntityScopes?.[entity] ?? []
  let appliedDriversGlobalScopes = vueModelState.drivers[driver].config?.globallyAppliedScopes ?? []
  let appliedDriversEntityScopes = vueModelState.drivers[driver].config?.globallyAppliedEntityScopes?.[entity] ?? []

  if (options?.withoutGlobalScopes) {
    appliedGlobalScopes = difference(appliedGlobalScopes, toValue(options.withoutGlobalScopes))
    appliedDriversGlobalScopes = difference(appliedDriversGlobalScopes, toValue(options.withoutGlobalScopes))
  }

  if (options?.withoutEntityGlobalScopes) {
    appliedEntityScopes = difference(appliedEntityScopes, toValue(options.withoutEntityGlobalScopes))
    appliedDriversEntityScopes = difference(appliedDriversEntityScopes, toValue(options.withoutEntityGlobalScopes))
  }

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
        return configuredScope({ entity, driver })
      } else {
        return configuredScope
      }
    } else if (typeof scope === 'object') {
      const configuredScope = configuredScopes[scope.name]
      if (typeof configuredScope === 'function') {
        const paramatersResolved = typeof scope.paramaters === 'function' ? scope.paramaters() : scope.paramaters
        return configuredScope({ entity, driver }, paramatersResolved ?? undefined)
      } else {
        return configuredScope
      }
    }

    throw new Error('could not resolve scope')
  })

  const result = deepmerge.all<ObjectQueryScope>(resolvedScopes)

  return {
    filters: result.filters ?? {},
    sortBy: result.sortBy ?? [],
    includes: result.includes ?? {},
  }
}
