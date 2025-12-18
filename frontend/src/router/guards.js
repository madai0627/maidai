/**
 * 路由守卫配置
 * 统一管理路由认证和权限检查
 */
import { useUserStore } from '@/stores/user'

/**
 * 设置路由守卫
 * @param {Router} router - Vue Router 实例
 */
export function setupRouterGuards(router) {
  // 路由前置守卫
  router.beforeEach((to, from, next) => {
    const userStore = useUserStore()
    
    // 初始化用户状态（如果未初始化）
    if (!userStore.isAuthenticated) {
      userStore.initUser()
    }
    
    // 登录页直接放行
    if (to.path === '/login') {
      return next()
    }
    
    // 未认证用户跳转登录页
    if (!userStore.isAuthenticated) {
      return next({
        path: '/login',
        query: { redirect: to.fullPath } // 保存原始路径，登录后可以跳转回来
      })
    }
    
    // 管理后台权限检查（可扩展）
    if (to.meta.requiresAdmin) {
      // TODO: 检查管理员权限
      // const hasAdminRole = userStore.userInfo?.role === 'admin'
      // if (!hasAdminRole) {
      //   return next({ path: '/', replace: true })
      // }
    }
    
    next()
  })
  
  // 路由后置守卫 - 设置页面标题
  router.afterEach((to) => {
    const title = to.meta?.title
    if (title) {
      document.title = `${title} - 麦袋`
    } else {
      document.title = '麦袋'
    }
  })
  
  // 路由错误处理
  router.onError((error) => {
    console.error('路由错误:', error)
  })
}

