/**
 * 应用状态管理 Store
 * 负责应用级状态，如侧边栏折叠、主题等
 */
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebarCollapsed: false,
    theme: 'light'
  }),
  
  actions: {
    /**
     * 切换侧边栏折叠状态
     */
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    
    /**
     * 设置侧边栏状态
     * @param {boolean} collapsed - 是否折叠
     */
    setSidebarCollapsed(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    /**
     * 设置主题
     * @param {string} theme - 主题名称
     */
    setTheme(theme) {
      this.theme = theme
    }
  },
  
  // 持久化配置（如果使用 pinia-plugin-persistedstate）
  persist: {
    paths: ['sidebarCollapsed', 'theme']
  }
})

