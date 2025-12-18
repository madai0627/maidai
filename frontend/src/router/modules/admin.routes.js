/**
 * 管理后台路由配置
 * 所有管理后台页面使用 AdminLayout 布局
 * 注意：路径是相对于 /admin 的相对路径
 */
export default [
  // 题库管理 - 分类管理
  {
    path: 'quiz/categories',
    name: 'QuizAdminCategory',
    component: () => import('@/views/quiz/AdminCategory.vue'),
    meta: { title: '分类管理', icon: 'Folder', parent: '题库管理' }
  },
  // 题库管理 - 题目管理
  {
    path: 'quiz/questions',
    name: 'QuizAdminQuestion',
    component: () => import('@/views/quiz/AdminQuestion.vue'),
    meta: { title: '题目管理', icon: 'Document', parent: '题库管理' }
  },
  
  // 照片管理 - 分类管理
  {
    path: 'photos/types',
    name: 'CatType',
    component: () => import('@/views/cat/CatType.vue'),
    meta: { title: '分类管理', icon: 'FolderChecked', parent: '照片管理' }
  },
  // 照片管理 - 照片管理
  {
    path: 'photos/list',
    name: 'CatInfo',
    component: () => import('@/views/cat/CatInfo.vue'),
    meta: { title: '照片管理', icon: 'Picture', parent: '照片管理' }
  },
  
  // 财务管理 - 用途管理
  {
    path: 'finance/purpose',
    name: 'FinancePurpose',
    component: () => import('@/views/finance/FinancePurpose.vue'),
    meta: { title: '用途管理', icon: 'Coin', parent: '财务管理' }
  },
  // 财务管理 - 预算管理
  {
    path: 'finance/budget',
    name: 'FinanceBudget',
    component: () => import('@/views/finance/FinanceBudget.vue'),
    meta: { title: '预算管理', icon: 'Tickets', parent: '财务管理' }
  },
  // 财务管理 - 记录管理
  {
    path: 'finance/records',
    name: 'FinanceRecord',
    component: () => import('@/views/finance/FinanceRecord.vue'),
    meta: { title: '记录管理', icon: 'Document', parent: '财务管理' }
  },
  
  // 系统管理 - 用户管理
  {
    path: 'system/users',
    name: 'User',
    component: () => import('@/views/system/User.vue'),
    meta: { title: '用户管理', icon: 'User', parent: '系统管理' }
  },
  // 系统管理 - 角色管理
  {
    path: 'system/roles',
    name: 'Role',
    component: () => import('@/views/system/Role.vue'),
    meta: { title: '角色管理', icon: 'UserFilled', parent: '系统管理' }
  }
]

