import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MovieDetail from '../views/MovieDetail.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import UserProfile from '../components/UserProfile.vue'
import { useAuthStore } from '../store/auth'
import { createPinia } from 'pinia'

const pinia = createPinia()

const routes = [
  {
    path: '/',
    name: 'HomeView',
    component: HomeView
  },
  {
    path: '/movie/:id',
    name: 'MovieDetail',
    component: MovieDetail
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard for protected routes
router.beforeEach(async (to, from, next) => {
  // Only check auth for routes that require it
  if (to.meta.requiresAuth) {
    // Use Pinia store instance
    const authStore = useAuthStore(pinia)
    // Wait for auth initialization if needed
    if (!authStore.initialized) {
      await new Promise(resolve => {
        const unwatch = authStore.$subscribe(() => {
          if (authStore.initialized) {
            unwatch()
            resolve()
          }
        })
      })
    }
    if (!authStore.user) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }
  }
  next()
})

export default router
