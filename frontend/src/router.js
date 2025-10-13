import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/Layout.vue'

const routes = [
  {
    path: '/',
    component: () => import('@/views/Index.vue'),
    hidden: true,
    name: 'Index'
  },
  {
    path: '/index-quiz',
    component: () => import('@/views/index-quiz/Index.vue'),
    hidden: true,
    name: 'IndexQuiz'
  },
  {
    path: '/quiz-admin',
    component: Layout,
    redirect: '/quiz-admin/categories',
    meta: { title: '题库管理', icon: 'Collection' },
    children: [
      {
        path: 'categories',
        component: () => import('@/views/quiz/AdminCategory.vue'),
        name: 'QuizAdminCategory',
        meta: { title: '分类管理', icon: 'Folder' }
      },
      {
        path: 'questions',
        component: () => import('@/views/quiz/AdminQuestion.vue'),
        name: 'QuizAdminQuestion',
        meta: { title: '题目管理', icon: 'Document' }
      }
    ]
  },
  {
    path: '/index-cat',
    component: () => import('@/views/index-cat/Index.vue'),
    hidden: true,
    name: 'IndexCat'
  },
  {
    path: '/index-finance',
    component: () => import('@/views/index-finance/Index.vue'),
    hidden: true,
    name: 'IndexFinance'
  },
  {
    path: '/cat',
    component: Layout,
    redirect: '/cat/cat-type',
    meta: { title: '宠物管理', icon: 'TrophyBase' },
    children: [
      {
        path: 'cat-type',
        component: () => import('@/views/cat/CatType.vue'),
        name: 'CatType',
        meta: { title: '分类管理', icon: 'FolderChecked' }
      },
      {
        path: 'cat-info',
        component: () => import('@/views/cat/CatInfo.vue'),
        name: 'CatInfo',
        meta: { title: '猫猫管理', icon: 'Watermelon' }
      },
    ]
  },
  {
    path: '/finance',
    component: Layout,
    meta: { title: '财务管理', icon: 'Coin' },
    children: [
      {
        path: 'purpose',
        component: () => import('@/views/finance/FinancePurpose.vue'),
        name: 'FinancePurpose',
        meta: { title: '用途管理', icon: 'Coin' }
      },
      {
        path: 'budget',
        component: () => import('@/views/finance/FinanceBudget.vue'),
        name: 'FinanceBudget',
        meta: { title: '预算管理', icon: 'Tickets' }
      },
      {
        path: 'record',
        component: () => import('@/views/finance/FinanceRecord.vue'),
        name: 'FinanceRecord',
        meta: { title: '记录管理', icon: 'Document' }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/User.vue'),
        name: 'User',
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'role',
        component: () => import('@/views/system/Role.vue'),
        name: 'Role',
        meta: { title: '角色管理', icon: 'UserFilled' }
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router