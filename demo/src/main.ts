import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { vueModel, piniaLocalStorage } from './vue-model'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vueModel)
app.use(piniaLocalStorage)

app.mount('#app')
