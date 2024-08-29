import { examples } from '../examples/examples'
import { createRouter, createWebHistory } from 'vue-router'

export const routes = Object.entries(examples).map(entry => {
  const entrySplit = entry[0].split('/')
  const entryName = entrySplit[entrySplit.length - 1].replace('.vue', '')

  return {
    path: '/' + entryName,
    component: entry[1],
  }
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
