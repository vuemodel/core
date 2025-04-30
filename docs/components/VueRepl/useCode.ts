const piniaOrm = createORM()
const piniaFront = createPinia()
const piniaBack = createPinia()
piniaFront.use(piniaOrm)

createIndexedDb({
  frontStore: piniaFront,
  backStore: piniaBack,
})
const vueModel = createVueModel({
  default: 'local',
  drivers: {
    local: {
      driver: {
        ...indexedDbVueModelDriver,
        useModel: useModelDriver,
      },
      config: { pinia: piniaFront },
    },
  },
})

app.use(piniaFront)
app.use(vueModel)
app.use(piniaOrm)
app.use(Quasar, {
  config: {
    brand: {
      primary: '#007ea7',
      secondary: '#003459',
      accent: '#00171f',
    },
  },
})

indexedDbState.mockLatencyMs = 1000
