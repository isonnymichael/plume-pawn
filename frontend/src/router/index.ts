import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Dashboard from '../pages/Dashboard.vue'
import useConnectStore from '../store/connect' // import pinia store
import { storeToRefs } from 'pinia'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard
router.beforeEach((to, from, next) => {
  const connectStore = useConnectStore()
  const { showDashboard } = storeToRefs(connectStore)

  if (!showDashboard.value && to.path !== '/') {
    next('/')
  } else if (showDashboard.value && to.path === '/') {
    next('/dashboard')
  } else {
    next()
  }
})


export default router
