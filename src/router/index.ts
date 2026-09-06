import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useTestSessionStore } from '../stores/testSession'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/TestView.vue')
    },
    {
      path: '/result',
      name: 'result',
      component: () => import('../views/ResultView.vue')
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const store = useTestSessionStore()
  if (to.name !== 'home' && !store.isActive) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
