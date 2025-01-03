import { createApp } from 'vue'
import { setupStore } from './store' // 状态管理
import router, { setupRouter } from './router' // 路由
import { setupElementPlus } from './libs/element' // element UI
import 'virtual:svg-icons-register' // Register icon sprite

import './styles/index.scss'


import mitt from 'mitt'

import App from './App.vue'



const app = createApp(App)

setupRouter(app) // 引入路由

setupStore(app) // 引入状态管理

setupElementPlus(app) // 引入element组件


app.config.globalProperties.mittBus = mitt()

router.isReady().then(() => {
  app.mount('#app')
})
