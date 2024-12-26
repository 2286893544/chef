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
        // 活动管理
        {
          path: "/active", name: "active", component: () => import("views/active/index.vue"),
          children: [
            { path: "info", name: "info", component: () => import("views/active/active.vue") },
            //活动说明图片
            { path: 'acspk', name: 'acspk', component: () => import('views/acspeak/index.vue'), },
          ]
        },
        { path: '/icon', name: 'icon', component: () => import('views/icon/index.vue'), },
        { path: '/athlete', name: 'athlete', component: () => import('views/elementIcon/index.vue'), },
        // 轮播图管理
        {
          path: '/carousel', name: 'carousel', component: () => import('views/carousel/index.vue'),
          children: [
            { path: 'carouseldx', name: "carouseldx", component: () => import('views/carousel/carousel.vue') },
          ]
        },
        // 职位管理
        {
          path: '/position', name: 'position', component: () => import('views/position/index.vue'),
          children: [
            { path: 'positionIdx', name: "positionIdx", component: () => import('views/position/position.vue') },
          ]
        },
        {
          path: "/riched/:id", name: "riched", component: () => import("views/riched/riched.vue")
        },
        // 留言板
        {
          path: "/comment/:id", name: "comment", component: () => import("views/comment/comment.vue"),
        },
        //投票记录
        { path: '/votehistory', name: 'votehistory', component: () => import('views/vote/index.vue'), },
        //个人投票记录
        {
          path: "/sinaply/:id", name: "sinaply", component: () => import("views/sinaply/index.vue")
        },
        // 礼物记录
        { path: "/present", name: "present", component: () => import("views/present/index.vue") },
        // 个人礼物记录
        { path: "/gift/:id", name: "gift", component: () => import("views/gift/index.vue") }
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
