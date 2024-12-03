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
        // { path: '/demo', name: 'demo', component: () => import('views/demo/index.vue'), },
        {
          path: "/active", name: "active", component: () => import("views/active/index.vue"),
          children: [
            {path: "info", name: "info", component: () => import("views/active/active.vue")}
          ]
        },
        { path: '/icon', name: 'icon', component: () => import('views/icon/index.vue'), },
        { path: '/elementIcon', name: 'elementIcon', component: () => import('views/elementIcon/index.vue'), },
        {
          path: '/carousel', name: 'carousel', component: () => import('views/carousel/index.vue'),
          children: [
            { path: 'index', name: "index", component: () => import('views/carousel/carousel.vue') },
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
