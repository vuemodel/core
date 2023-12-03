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
  drivers: {
    local: {
      implementation: piniaLocalVueModelDriver,
      config: { pinia: piniaFront },
    },
  },
})

app.use(piniaFront)
app.use(vueModel)
app.use(piniaLocalStorage)
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

piniaLocalStorageState.mockLatencyMs = 1000