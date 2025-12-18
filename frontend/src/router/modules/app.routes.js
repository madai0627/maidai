/**
 * 用户功能路由配置
 * 所有用户功能页面使用 AppLayout 布局
 */
export default [
  {
    path: '',
    name: 'Index',
    component: () => import('@/views/home/Index.vue'),
    meta: { title: '个人中心', navKey: 'home' }
  },
  {
    path: 'diary',
    name: 'IndexDiary',
    component: () => import('@/views/diary/Index.vue'),
    meta: { title: '日记', navKey: 'diary' }
  },
  {
    path: 'photos',
    name: 'IndexCat',
    component: () => import('@/views/index-cat/Index.vue'),
    meta: { title: '照片墙', navKey: 'photos' }
  },
  {
    path: 'finance',
    name: 'IndexFinance',
    component: () => import('@/views/index-finance/Index.vue'),
    meta: { title: '财务', navKey: 'finance' }
  },
  {
    path: 'study',
    name: 'IndexQuiz',
    component: () => import('@/views/index-quiz/Index.vue'),
    meta: { title: '学习', navKey: 'study' }
  },
  {
    path: 'study/wrong',
    name: 'IndexQuizWrong',
    component: () => import('@/views/index-quiz-wrong/Index.vue'),
    meta: { title: '错题本', navKey: 'study' }
  },
  {
    path: 'study/favorites',
    name: 'IndexQuizFavorites',
    component: () => import('@/views/index-quiz-favorites/Index.vue'),
    meta: { title: '我的收藏', navKey: 'study' }
  }
]

