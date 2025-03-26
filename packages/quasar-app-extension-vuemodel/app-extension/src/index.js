import { readFile, writeFile } from 'node:fs/promises'
import inflection from 'inflection'

export default function (api) {
  api.compatibleWith('quasar', '^2.0.0')

  if (api.hasVite) {
    api.compatibleWith('@quasar/app-vite', '^1.5.0 || ^2.0.0')
  } else if (api.hasWebpack) {
    api.compatibleWith('@quasar/app-webpack', '^3.10.0 || ^4.0.0')
  }

  api.extendQuasarConf((conf, _api) => {
    conf.framework.plugins.push('Loading')

    if (api.hasWebpack) {
      // make sure app extension files & ui package gets transpiled
      const transpileTarget = (
        conf.build.webpackTranspileDependencies || // q/app-webpack >= v4
        conf.build.transpileDependencies // q/app-webpack v3
      )
      transpileTarget.push(/quasar-app-extension-auth[\\/]src/)
    }
  }, api)

  /**
   * @param {string} commandName
   * @param {function} fn
   *   ({ args: [ string, ... ], params: {object} }) => ?Promise
   */
  api.registerCommand('make:model', async ({ args, params }) => {
    const extension = (await api.hasTypescript()) ? 'ts' : 'js'
    const resourceName = args[0]
    let stub = await readFile(`./stubs/Model.stub.${extension}`, { encoding: 'utf-8' })

    const resourceClass = inflection.classify(resourceName)

    const nameCases = [
      { kind: 'resourceClass', value: resourceClass },
      { kind: 'resourceCamel', value: inflection.camelize(resourceName) },
      { kind: 'resourceUnderscore', value: inflection.underscore(resourceName) },
      { kind: 'resourceDash', value: inflection.dasherize(resourceName) },
      { kind: 'resourceTable', value: inflection.tableize(resourceName) },
    ]

    nameCases.forEach(nameCase => {
      stub = stub.replaceAll(`{{ ${nameCase.kind} }}`, nameCase.value)
    })

    writeFile(`./src/models/${resourceClass}.${extension}`, stub)
  })
}
