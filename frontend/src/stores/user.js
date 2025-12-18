/**
 * 用户状态管理 Store
 * 负责用户认证、用户信息等状态管理
 */
import { defineStore } from 'pinia'
import { logoutSync } from '@/api/modules/auth'

const AUTH_KEY = 'userInfo'
const AUTH_EXPIRE = 12 * 60 * 60 * 1000 // 12小时

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    isAuthenticated: false
  }),
  
  getters: {
    username: (state) => state.userInfo?.username || '',
    userId: (state) => state.userInfo?.id || null,
    avatar: (state) => state.userInfo?.avatar || ''
  },
  
  actions: {
    /**
     * 初始化用户状态（从 localStorage 恢复）
     * @returns {boolean} 是否成功初始化
     */
    initUser() {
      try {
        const stored = localStorage.getItem(AUTH_KEY)
        if (!stored) {
          this.clearUser()
          return false
        }
        
        const info = JSON.parse(stored)
        const isExpired = info.timeTemp && (Date.now() - info.timeTemp > AUTH_EXPIRE)
        
        if (isExpired) {
          this.clearUser()
          return false
        }
        
        this.userInfo = info
        this.isAuthenticated = true
        return true
      } catch (error) {
        console.error('用户信息解析失败:', error)
        this.clearUser()
        return false
      }
    },
    
    /**
     * 登录成功后设置用户信息
     * @param {Object} info - 用户信息
     */
    setUser(info) {
      const userInfo = {
        ...info,
        timeTemp: Date.now()
      }
      this.userInfo = userInfo
      this.isAuthenticated = true
      localStorage.setItem(AUTH_KEY, JSON.stringify(userInfo))
    },
    
    /**
     * 清除用户状态
     */
    clearUser() {
      this.userInfo = null
      this.isAuthenticated = false
      localStorage.removeItem(AUTH_KEY)
    },
    
    /**
     * 登出
     */
    async logout() {
      try {
        await logoutSync()
      } catch (error) {
        console.error('登出请求失败:', error)
      } finally {
        this.clearUser()
      }
    }
  }
})

