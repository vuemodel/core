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
app.use(Quasar)
