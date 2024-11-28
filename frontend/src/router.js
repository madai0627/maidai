import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/Layout.vue'

const routes = [
  {
    path: '/',
    component: () => import('@/views/Index.vue'),
    meta: { title: '首页', icon: 'HomeFilled' },
  },
  {
    path: '/cat',
    component: Layout,
    redirect: '/cat/cat-type',
    meta: { title: '宠物管理', icon: 'Setting' },
    children: [
      {
        path: 'cat-type',
        component: () => import('@/views/CatType.vue'),
        name: 'CatType',
        meta: { title: '分类管理', icon: 'Odometer' }
      },
      {
        path: 'cat-info',
        component: () => import('@/views/CatInfo.vue'),
        name: 'CatInfo',
        meta: { title: '猫猫管理', icon: 'Odometer' }
      },
    ]
  },
  {
    path: '/system',
    component: Layout,
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user.vue'),
        name: 'User',
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'role',
        component: () => import('@/views/system/role.vue'),
        name: 'Role',
        meta: { title: '角色管理', icon: 'UserFilled' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router