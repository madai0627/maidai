/**
 * Pinia Store 入口文件
 * 统一导出所有 Store 并配置插件
 */
import { createPinia } from 'pinia'

const pinia = createPinia()

// 如果安装了 pinia-plugin-persistedstate，可以在这里使用
// import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// pinia.use(piniaPluginPersistedstate)

export default pinia

