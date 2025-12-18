/**
 * 导航配置常量
 * 用于统一管理用户功能和管理后台的导航项
 */

// 用户功能导航配置
export const NAV_ITEMS = [
  { key: 'home', path: '/', label: '个人中心', icon: 'House' },
  { key: 'diary', path: '/diary', label: '日记', icon: 'Notebook' },
  { key: 'photos', path: '/photos', label: '照片墙', icon: 'Picture' },
  { key: 'finance', path: '/finance', label: '财务', icon: 'Coin' },
  { key: 'study', path: '/study', label: '学习', icon: 'Reading' }
]

// 管理后台导航配置
export const ADMIN_NAV_ITEMS = [
  { key: 'quiz', path: '/admin/quiz/categories', label: '题库管理', icon: 'Collection' },
  { key: 'photos', path: '/admin/photos/types', label: '照片管理', icon: 'Picture' },
  { key: 'finance', path: '/admin/finance/purpose', label: '财务管理', icon: 'Coin' },
  { key: 'system', path: '/admin/system/users', label: '系统管理', icon: 'Setting' }
]

