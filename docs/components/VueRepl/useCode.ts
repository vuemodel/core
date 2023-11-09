const piniaOrm = createORM()
const piniaFront = createPinia()
const piniaBack = createPinia()
piniaFront.use(piniaOrm)

const piniaLocalStorage = createPiniaLocalStorage({
  frontStore: piniaFront,
  backStore: piniaBack,
})
const vueModel = createVueModel({
  default: 'local',
  drivers: { local: { ...piniaLocalVueModelDriver, config: { pinia: piniaFront } } },
})

app.use(piniaFront)
app.use(vueModel)
app.use(piniaLocalStorage)
app.use(piniaOrm)
app.use(Quasar)

async function populateRecords (
  entity,
  numberOfRecords,
  createOptions,
) {
  const exampleData = exampleDataMap[entity]

  if (!numberOfRecords) {
    numberOfRecords = exampleData.records.length
  }

  for (let index = 0; index < numberOfRecords; index++) {
    const foundResource = await findResource(exampleData.records[index].id)
    if (foundResource) continue
    await createResource(
      exampleData.modelClass,
      exampleData.records[index],
      createOptions,
    )
  }
};