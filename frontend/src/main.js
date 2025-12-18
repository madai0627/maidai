import { createApp } from 'vue'
import App from './App.vue'
// 导入路由实例（从新的 router/index.js）
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import pinia from './stores'
import jQuery from 'jquery'
import Util from '@/util/util'
import '@/styles/index.scss'

window.$ = window.jQuery = jQuery

const app = createApp(App)
window.Util = Util

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 先使用插件
app.use(router)
app.use(pinia)
app.use(ElementPlus)

// 最后挂载应用
app.mount('#app')
