import { createRouter, createWebHistory } from 'vue-router'
import type { App } from 'vue'

const routerHistory = createWebHistory()
// createWebHashHistory hash 路由
// createWebHistory history 路由
// createMemoryHistory 带缓存 history 路由

const Layout = () => import('@/layout/index.vue')

const router = createRouter({
  history: routerHistory,
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: '/home',
      children: [
        { path: '/home', name: 'home', component: () => import('views/home/index.vue'), },
        { path: '/demo', name: 'demo', component: () => import('views/demo/index.vue'), },
        { path: '/icon', name: 'icon', component: () => import('views/icon/index.vue'), },
        { path: '/elementIcon', name: 'elementIcon', component: () => import('views/elementIcon/index.vue'), },
        {
          path: '/person', name: 'person', component: () => import('views/person/person.vue'),
          children: [
            { path: 'er', name: "er", component: () => import('views/person/index.vue') },
            { path: 'Two', name: "tw", component: () => import('views/person/Two.vue') },
          ]
        }
      ]
    }
  ]
})

// 删除/重置路由
export function resetRoute(): void {
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export function setupRouter(app: App<Element>): void {
  app.use(router)
}
export default router
