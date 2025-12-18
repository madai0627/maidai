/**
 * 主路由配置文件
 * 统一管理所有路由，使用模块化路由配置
 */
import { createRouter, createWebHistory } from 'vue-router'
import { setupRouterGuards } from './guards'
import appRoutes from './modules/app.routes'
import adminRoutes from './modules/admin.routes'

const routes = [
  // ============ 认证相关 ============
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { requiresAuth: false, layout: 'blank' }
  },

  // ============ 用户功能区（AppLayout）============
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    children: appRoutes
  },

  // ============ 管理后台（AdminLayout）============
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      // 默认重定向到题库管理
      {
        path: '',
        redirect: '/admin/quiz/categories'
      },
      ...adminRoutes
    ]
  },

  // ============ 兼容旧路由（重定向）============
  // 用户功能路由重定向
  { 
    path: '/index-diary', 
    redirect: '/diary' 
  },
  { 
    path: '/index-cat', 
    redirect: '/photos' 
  },
  { 
    path: '/index-finance', 
    redirect: '/finance' 
  },
  { 
    path: '/index-quiz', 
    redirect: '/study' 
  },
  { 
    path: '/index-quiz-wrong', 
    redirect: '/study/wrong' 
  },
  { 
    path: '/index-quiz-favorites', 
    redirect: '/study/favorites' 
  },
  
  // 管理后台路由重定向
  { 
    path: '/quiz-admin', 
    redirect: '/admin/quiz/categories' 
  },
  { 
    path: '/quiz-admin/:path(.*)', 
    redirect: to => `/admin/quiz/${to.params.path}` 
  },
  { 
    path: '/cat', 
    redirect: '/admin/photos/types' 
  },
  { 
    path: '/cat/:path(.*)', 
    redirect: to => {
      // 映射旧路径到新路径
      const pathMap = {
        'cat-type': 'types',
        'cat-info': 'list'
      }
      const newPath = pathMap[to.params.path] || to.params.path
      return `/admin/photos/${newPath}`
    }
  },
  { 
    path: '/finance/:path(.*)', 
    redirect: to => {
      // 映射旧路径到新路径
      const pathMap = {
        'purpose': 'purpose',
        'budget': 'budget',
        'record': 'records'
      }
      const newPath = pathMap[to.params.path] || to.params.path
      return `/admin/finance/${newPath}`
    }
  },
  { 
    path: '/system/:path(.*)', 
    redirect: to => {
      // 映射旧路径到新路径
      const pathMap = {
        'user': 'users',
        'role': 'roles'
      }
      const newPath = pathMap[to.params.path] || to.params.path
      return `/admin/system/${newPath}`
    }
  },

  // ============ 404 页面 ============
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue').catch(() => {
      // 如果 404 页面不存在，返回首页
      return { template: '<div>页面未找到</div>' }
    })
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 安装路由守卫
setupRouterGuards(router)

export default router

