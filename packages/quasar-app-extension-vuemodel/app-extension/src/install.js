import addBootFile from './addBootFile.js'
import providerDependencies from './providerDependencies.js'

export default async function (api) {
  const hasTypescript = api.hasTypescript()
  const subfolderName = hasTypescript ? 'ts' : 'js'

  const provider = api.prompts.provider
  const providerPackage = provider.packageName
  const providerIdentifier = provider.identifier
  const providerIdentifierPascal = capitalizeFirstLetter(providerIdentifier)

  api.render(`./templates/${subfolderName}`, {
    providerPackage,
    providerIdentifier,
    providerIdentifierPascal,
  })

  api.render(`./provider-specific-templates/${subfolderName}/${providerIdentifier}`)

  if (api.prompts.setup.includes('registerBootFile')) {
    const quasarConfigFile = api.resolve.app(`quasar.config.${subfolderName}`)
    addBootFile(quasarConfigFile, 'vuemodel')
  }

  const dependencies = providerDependencies[providerIdentifier]

  if (dependencies) {
    api.extendPackageJson(dependencies)
  }
}

function capitalizeFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
