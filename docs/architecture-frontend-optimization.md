# 前端架构优化方案

> 📅 创建日期: 2024-12-17  
> 📊 版本: v1.0  
> 👤 作者: Winston (Architect)  
> 🎯 状态: 待评审  
> 📎 关联文档: [前端用户体验优化方案](./brief-frontend-ux-optimization.md)

---

## 1. 执行摘要 (Executive Summary)

**项目名称：** maidai 前端架构优化

**优化目标：**
针对当前前端代码架构进行系统性重构，解决路由分层混乱、布局系统不统一、状态管理分散、API 组织不规范等架构问题，提升代码可维护性、可扩展性和开发效率。

**核心问题：**
1. 路由架构混乱：用户功能与管理后台路由前缀不统一，命名不规范
2. 布局系统缺失：用户功能页面无统一 Layout，代码重复
3. 状态管理分散：用户认证状态在组件内管理，缺乏全局状态
4. API 架构单一：所有 API 集中在单文件，维护困难
5. 目录结构混乱：用户功能与管理功能目录混杂

**预期收益：**
- 代码复用率提升 40%+
- 新功能开发效率提升 30%+
- Bug 定位时间减少 50%+
- 团队协作效率显著提升

---

## 2. 现状分析 (Current State Analysis)

### 2.1 路由架构问题

#### 当前路由结构

```
router.js (142行，扁平化结构)
│
├── /                      → 首页 (直接加载组件，无 Layout)
├── /index-quiz            → 做题 (无 Layout)
├── /index-quiz-wrong      → 错题 (无 Layout)
├── /index-quiz-favorites  → 收藏 (无 Layout)
├── /index-cat             → 宠物/照片墙 (无 Layout)
├── /index-finance         → 财务 (无 Layout)
├── /index-diary           → 日记 (无 Layout)
│
├── /quiz-admin/*          → 题库管理 (使用 Layout)
├── /cat/*                 → 宠物管理 (使用 Layout)
├── /finance/*             → 财务管理 (使用 Layout)
├── /system/*              → 系统管理 (使用 Layout)
│
└── /login                 → 登录页 (无保护)
```

#### 问题诊断

| 问题 | 严重程度 | 具体表现 | 架构影响 |
|------|---------|---------|---------|
| 路由命名不规范 | 🟡 中等 | `/index-xxx` 前缀冗余 | URL 可读性差，SEO 不友好 |
| 管理路由前缀不统一 | 🔴 严重 | `/quiz-admin`, `/cat`, `/finance` 混用 | 权限控制困难，代码难维护 |
| 用户页面无 Layout | 🔴 严重 | 每个页面单独引入 Navbar | 代码重复，维护成本高 |
| 路由守卫分散 | 🟡 中等 | 认证逻辑在 Navbar 组件中 | 安全隐患，无法统一控制 |
| 路由配置无模块化 | 🟡 中等 | 所有路由在单文件 | 文件膨胀，协作困难 |

### 2.2 布局系统问题

#### 当前布局结构

```
src/
├── layout/
│   └── Layout.vue         # 仅管理后台使用（带侧边栏）
└── components/
    ├── Navbar.vue         # 导航栏（用户页面单独引入）
    ├── Sidebar.vue        # 侧边栏（管理后台专用）
    └── Breadcrumb.vue     # 面包屑（管理后台专用）
```

#### 用户页面布局现状

```vue
<!-- 每个用户功能页面都需要重复这段代码 -->
<template>
  <el-container class="layout-container">
    <el-header>
      <Navbar />  <!-- 重复引入 -->
    </el-header>
    <el-main>
      <!-- 页面内容 -->
    </el-main>
  </el-container>
</template>

<script setup>
import Navbar from "@/components/Navbar.vue"  // 重复导入
</script>

<style scoped>
.layout-container { height: 100vh; }  // 重复样式
.main-content { /* ... */ }
</style>
```

#### 问题诊断

| 问题 | 严重程度 | 影响范围 | 后果 |
|------|---------|---------|------|
| 用户功能无统一布局 | 🔴 严重 | 6个用户页面 | 代码重复 600+ 行 |
| 布局样式分散 | 🟡 中等 | 所有页面 | 样式不一致，维护困难 |
| 无布局分层设计 | 🟡 中等 | 整体架构 | 扩展新布局困难 |

### 2.3 状态管理问题

#### 当前 Store 结构

```javascript
// store.js (9行)
import { defineStore } from "pinia"

const userStore = defineStore("counter", {
    state: () => ({
        isCloseSide: false,  // 仅侧边栏折叠状态
    }),
})

export default userStore
```

#### 认证状态管理现状

```javascript
// Navbar.vue 中的认证逻辑（应该在 Store 中）
const username = ref('')
username.value = JSON.parse(localStorage.getItem('userInfo'))?.username
let timeTemp = JSON.parse(localStorage.getItem('userInfo'))?.timeTemp
let currentTime = new Date().getTime()
if (!username.value || currentTime - timeTemp > 12 * 60 * 60 * 1000) {
  localStorage.removeItem('userInfo')
  router.push('/login')
}
```

#### 问题诊断

| 问题 | 严重程度 | 影响 |
|------|---------|------|
| 用户状态在组件内管理 | 🔴 严重 | 状态分散，无法全局访问 |
| Store 命名不规范 | 🟡 中等 | "counter" 名称误导 |
| 无模块化设计 | 🟡 中等 | 所有状态将混在一起 |
| 认证逻辑重复 | 🔴 严重 | 多处需要重复校验代码 |

### 2.4 API 架构问题

#### 当前 API 结构

```
src/api/
└── index.js  (171行，持续增长)
    ├── Cat 相关 API (8个)
    ├── User 相关 API (7个)
    ├── Role 相关 API (4个)
    ├── CatType 相关 API (4个)
    ├── 图片上传 API (2个)
    ├── Finance 相关 API (13个)
    ├── 照片墙 API (5个)
    ├── Quiz 相关 API (20个)
    └── Diary 相关 API (7个)
```

#### 问题诊断

| 问题 | 严重程度 | 影响 |
|------|---------|------|
| 单文件过大 | 🟡 中等 | 171行且持续增长，难以查找 |
| 无模块化组织 | 🟡 中等 | 相关 API 分散，难以维护 |
| 命名风格不统一 | 🟢 轻微 | `xxxSync` 与普通命名混用 |

### 2.5 目录结构问题

#### 当前目录结构

```
src/views/
├── Index.vue                    # 首页（学习仪表板）
├── login/                       # 登录
├── index-cat/                   # 用户-照片墙
├── index-finance/               # 用户-财务
├── index-quiz/                  # 用户-学习
├── index-quiz-wrong/            # 用户-错题
├── index-quiz-favorites/        # 用户-收藏
├── diary/                       # 用户-日记 ← 命名正常
│
├── cat/                         # 管理-照片（与 index-cat 混淆）
├── finance/                     # 管理-财务（与 index-finance 混淆）
├── quiz/                        # 管理-题库
└── system/                      # 管理-系统
```

#### 问题诊断

| 问题 | 严重程度 | 影响 |
|------|---------|------|
| 用户功能命名不一致 | 🟡 中等 | `index-xxx` 与 `diary` 不统一 |
| 用户/管理目录混杂 | 🔴 严重 | `cat` 既是管理也像用户功能 |
| 无 admin 统一目录 | 🔴 严重 | 管理功能分散，职责不清 |

---

## 3. 目标架构设计 (Target Architecture)

### 3.1 架构分层设计

```
┌─────────────────────────────────────────────────────────────────┐
│                        前端架构分层                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      表现层 (Views)                       │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐    │   │
│  │  │ 认证页面   │  │ 用户功能   │  │    管理后台        │    │   │
│  │  │ /login    │  │ /diary    │  │    /admin/*       │    │   │
│  │  │           │  │ /photos   │  │                   │    │   │
│  │  │           │  │ /finance  │  │                   │    │   │
│  │  │           │  │ /study    │  │                   │    │   │
│  │  └───────────┘  └───────────┘  └───────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      布局层 (Layouts)                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │ BlankLayout  │  │  AppLayout   │  │ AdminLayout  │   │   │
│  │  │   (登录)     │  │  (用户功能)   │  │  (管理后台)   │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      路由层 (Router)                      │   │
│  │  ┌──────────┐  ┌────────────┐  ┌────────────────────┐   │   │
│  │  │ 认证路由  │  │ 用户功能路由 │  │   管理后台路由      │   │   │
│  │  │ /login   │  │ app.routes │  │   admin.routes     │   │   │
│  │  └──────────┘  └────────────┘  └────────────────────┘   │   │
│  │                    路由守卫 (认证 + 权限)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      状态层 (Stores)                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐    │   │
│  │  │ userStore  │  │ appStore   │  │  moduleStores  │    │   │
│  │  │  用户状态   │  │  应用状态   │  │   业务状态      │    │   │
│  │  └────────────┘  └────────────┘  └────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                       API 层 (API)                        │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐  │   │
│  │  │  auth  │ │ diary  │ │ photos │ │finance │ │ quiz │  │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └──────┘  │   │
│  │                     HTTP 请求封装                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 目标目录结构

```
src/
│
├── api/                              # API 层
│   ├── index.js                      # 统一导出
│   └── modules/                      # 模块化 API
│       ├── auth.js                   # 认证相关
│       ├── user.js                   # 用户管理
│       ├── diary.js                  # 日记模块
│       ├── photos.js                 # 照片墙模块
│       ├── finance.js                # 财务模块
│       ├── quiz.js                   # 题库模块
│       └── dashboard.js              # 首页统计
│
├── assets/                           # 静态资源
│   ├── images/
│   └── fonts/
│
├── components/                       # 通用组件
│   ├── common/                       # 公共组件
│   │   └── EmptyState.vue
│   └── business/                     # 业务组件
│       └── diary/
│           ├── DiaryCard.vue
│           ├── MoodChart.vue
│           └── MoodSelector.vue
│
├── constants/                        # 常量配置
│   ├── index.js                      # 统一导出
│   ├── diary.js                      # 日记常量
│   └── nav.js                        # 导航配置
│
├── layouts/                          # 布局组件
│   ├── AppLayout.vue                 # 用户功能布局
│   ├── AdminLayout.vue               # 管理后台布局
│   ├── BlankLayout.vue               # 空白布局
│   └── components/                   # 布局子组件
│       ├── AppNavbar.vue             # 用户导航条
│       ├── AdminSidebar.vue          # 管理侧边栏
│       ├── AdminHeader.vue           # 管理顶栏
│       └── Breadcrumb.vue            # 面包屑
│
├── router/                           # 路由配置
│   ├── index.js                      # 主路由 + 守卫
│   ├── guards.js                     # 路由守卫
│   └── modules/                      # 模块化路由
│       ├── app.routes.js             # 用户功能路由
│       └── admin.routes.js           # 管理后台路由
│
├── stores/                           # Pinia 状态管理
│   ├── index.js                      # Store 注册
│   ├── user.js                       # 用户状态
│   └── app.js                        # 应用状态
│
├── styles/                           # 全局样式
│   ├── index.scss                    # 入口文件
│   ├── variables.scss                # 变量定义
│   ├── mixins.scss                   # 混入
│   └── common.scss                   # 公共样式
│
├── utils/                            # 工具函数
│   ├── request.js                    # HTTP 请求封装
│   ├── storage.js                    # 存储工具
│   ├── date.js                       # 日期工具
│   └── util.js                       # 通用工具
│
├── views/                            # 页面视图
│   │
│   ├── auth/                         # 认证相关
│   │   └── Login.vue
│   │
│   ├── home/                         # 个人中心（新首页）
│   │   ├── Index.vue
│   │   └── components/
│   │       ├── WelcomeHeader.vue     # 欢迎语
│   │       ├── QuickActions.vue      # 快速操作
│   │       ├── WeeklyOverview.vue    # 本周概览
│   │       └── RecentActivities.vue  # 最近动态
│   │
│   ├── diary/                        # 日记模块
│   │   ├── Index.vue
│   │   └── components/
│   │       ├── DiaryList.vue
│   │       ├── DiaryEdit.vue
│   │       ├── DiaryDetail.vue
│   │       └── DiaryStats.vue
│   │
│   ├── photos/                       # 照片墙模块
│   │   └── Index.vue
│   │
│   ├── finance/                      # 财务记账模块
│   │   └── Index.vue
│   │
│   ├── study/                        # 学习模块
│   │   ├── Index.vue                 # 做题页
│   │   ├── Wrong.vue                 # 错题本
│   │   └── Favorites.vue             # 收藏夹
│   │
│   └── admin/                        # 管理后台
│       ├── quiz/                     # 题库管理
│       │   ├── Categories.vue
│       │   └── Questions.vue
│       ├── photos/                   # 照片管理
│       │   ├── Types.vue
│       │   └── List.vue
│       ├── finance/                  # 财务管理
│       │   ├── Purpose.vue
│       │   ├── Budget.vue
│       │   └── Records.vue
│       └── system/                   # 系统管理
│           ├── Users.vue
│           └── Roles.vue
│
├── App.vue                           # 根组件
└── main.js                           # 入口文件
```

### 3.3 路由架构设计

#### 3.3.1 路由命名规范

| 路由类型 | 命名规范 | 示例 |
|---------|---------|------|
| 用户功能 | `/{module}` | `/diary`, `/photos`, `/finance` |
| 用户子功能 | `/{module}/{action}` | `/study/wrong`, `/study/favorites` |
| 管理后台 | `/admin/{module}` | `/admin/quiz`, `/admin/photos` |
| 管理子功能 | `/admin/{module}/{action}` | `/admin/quiz/categories` |

#### 3.3.2 路由配置

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { setupRouterGuards } from './guards'
import appRoutes from './modules/app.routes'
import adminRoutes from './modules/admin.routes'

const routes = [
  // 认证路由（无布局）
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },

  // 用户功能路由（AppLayout）
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    children: appRoutes
  },

  // 管理后台路由（AdminLayout）
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/admin/quiz/categories',
    meta: { requiresAdmin: true },
    children: adminRoutes
  },

  // 兼容旧路由
  { path: '/index-diary', redirect: '/diary' },
  { path: '/index-cat', redirect: '/photos' },
  { path: '/index-finance', redirect: '/finance' },
  { path: '/index-quiz', redirect: '/study' },
  { path: '/index-quiz-wrong', redirect: '/study/wrong' },
  { path: '/index-quiz-favorites', redirect: '/study/favorites' },
  { path: '/quiz-admin/:path(.*)?', redirect: to => `/admin/quiz/${to.params.path || ''}` },
  { path: '/cat/:path(.*)?', redirect: to => `/admin/photos/${to.params.path || ''}` },
  { path: '/finance/:path(.*)?', redirect: to => `/admin/finance/${to.params.path || ''}` },
  { path: '/system/:path(.*)?', redirect: to => `/admin/system/${to.params.path || ''}` },

  // 404
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 安装路由守卫
setupRouterGuards(router)

export default router
```

```javascript
// src/router/modules/app.routes.js
export default [
  {
    path: '',
    name: 'Home',
    component: () => import('@/views/home/Index.vue'),
    meta: { title: '个人中心', navKey: 'home' }
  },
  {
    path: 'diary',
    name: 'Diary',
    component: () => import('@/views/diary/Index.vue'),
    meta: { title: '日记', navKey: 'diary' }
  },
  {
    path: 'photos',
    name: 'Photos',
    component: () => import('@/views/photos/Index.vue'),
    meta: { title: '照片墙', navKey: 'photos' }
  },
  {
    path: 'finance',
    name: 'Finance',
    component: () => import('@/views/finance/Index.vue'),
    meta: { title: '财务', navKey: 'finance' }
  },
  {
    path: 'study',
    name: 'Study',
    component: () => import('@/views/study/Index.vue'),
    meta: { title: '学习', navKey: 'study' }
  },
  {
    path: 'study/wrong',
    name: 'StudyWrong',
    component: () => import('@/views/study/Wrong.vue'),
    meta: { title: '错题本', navKey: 'study' }
  },
  {
    path: 'study/favorites',
    name: 'StudyFavorites',
    component: () => import('@/views/study/Favorites.vue'),
    meta: { title: '我的收藏', navKey: 'study' }
  }
]
```

```javascript
// src/router/modules/admin.routes.js
export default [
  // 题库管理
  {
    path: 'quiz',
    redirect: '/admin/quiz/categories',
    meta: { title: '题库管理', icon: 'Collection' },
    children: [
      {
        path: 'categories',
        name: 'AdminQuizCategories',
        component: () => import('@/views/admin/quiz/Categories.vue'),
        meta: { title: '分类管理', icon: 'Folder' }
      },
      {
        path: 'questions',
        name: 'AdminQuizQuestions',
        component: () => import('@/views/admin/quiz/Questions.vue'),
        meta: { title: '题目管理', icon: 'Document' }
      }
    ]
  },
  // 照片管理
  {
    path: 'photos',
    redirect: '/admin/photos/types',
    meta: { title: '照片管理', icon: 'Picture' },
    children: [
      {
        path: 'types',
        name: 'AdminPhotosTypes',
        component: () => import('@/views/admin/photos/Types.vue'),
        meta: { title: '分类管理', icon: 'FolderChecked' }
      },
      {
        path: 'list',
        name: 'AdminPhotosList',
        component: () => import('@/views/admin/photos/List.vue'),
        meta: { title: '照片管理', icon: 'Picture' }
      }
    ]
  },
  // 财务管理
  {
    path: 'finance',
    redirect: '/admin/finance/purpose',
    meta: { title: '财务管理', icon: 'Coin' },
    children: [
      {
        path: 'purpose',
        name: 'AdminFinancePurpose',
        component: () => import('@/views/admin/finance/Purpose.vue'),
        meta: { title: '用途管理', icon: 'Coin' }
      },
      {
        path: 'budget',
        name: 'AdminFinanceBudget',
        component: () => import('@/views/admin/finance/Budget.vue'),
        meta: { title: '预算管理', icon: 'Tickets' }
      },
      {
        path: 'records',
        name: 'AdminFinanceRecords',
        component: () => import('@/views/admin/finance/Records.vue'),
        meta: { title: '记录管理', icon: 'Document' }
      }
    ]
  },
  // 系统管理
  {
    path: 'system',
    redirect: '/admin/system/users',
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: 'users',
        name: 'AdminSystemUsers',
        component: () => import('@/views/admin/system/Users.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'roles',
        name: 'AdminSystemRoles',
        component: () => import('@/views/admin/system/Roles.vue'),
        meta: { title: '角色管理', icon: 'UserFilled' }
      }
    ]
  }
]
```

```javascript
// src/router/guards.js
import { useUserStore } from '@/stores/user'

export function setupRouterGuards(router) {
  router.beforeEach((to, from, next) => {
    const userStore = useUserStore()
    
    // 初始化用户状态
    if (!userStore.isAuthenticated) {
      userStore.initUser()
    }
    
    // 登录页直接放行
    if (to.path === '/login') {
      return next()
    }
    
    // 未认证跳转登录
    if (!userStore.isAuthenticated) {
      return next('/login')
    }
    
    // 管理后台权限检查（可扩展）
    if (to.meta.requiresAdmin) {
      // TODO: 检查管理员权限
    }
    
    next()
  })
  
  // 设置页面标题
  router.afterEach((to) => {
    document.title = to.meta.title ? `${to.meta.title} - 麦袋` : '麦袋'
  })
}
```

### 3.4 布局系统设计

#### 3.4.1 用户功能布局

```vue
<!-- src/layouts/AppLayout.vue -->
<template>
  <el-container class="app-layout">
    <el-header class="app-header">
      <AppNavbar />
    </el-header>
    <el-main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
  </el-container>
</template>

<script setup>
import AppNavbar from './components/AppNavbar.vue'
</script>

<style scoped lang="scss">
.app-layout {
  min-height: 100vh;
}

.app-header {
  height: 60px;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.app-main {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

#### 3.4.2 管理后台布局

```vue
<!-- src/layouts/AdminLayout.vue -->
<template>
  <el-container class="admin-layout">
    <el-aside :width="sidebarWidth" class="admin-aside">
      <AdminSidebar />
    </el-aside>
    <el-container class="admin-main-container" :class="{ collapsed: appStore.sidebarCollapsed }">
      <el-header class="admin-header">
        <AdminHeader />
      </el-header>
      <el-main class="admin-main">
        <Breadcrumb />
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import AdminSidebar from './components/AdminSidebar.vue'
import AdminHeader from './components/AdminHeader.vue'
import Breadcrumb from './components/Breadcrumb.vue'

const appStore = useAppStore()

const sidebarWidth = computed(() => 
  appStore.sidebarCollapsed ? '64px' : '200px'
)
</script>

<style scoped lang="scss">
.admin-layout {
  height: 100vh;
}

.admin-aside {
  transition: width 0.3s;
  overflow: hidden;
}

.admin-main-container {
  transition: margin-left 0.3s;
}

.admin-header {
  height: 60px;
  padding: 0;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
}

.admin-main {
  padding: 20px;
  background: #f0f2f5;
}
</style>
```

#### 3.4.3 用户导航组件

```vue
<!-- src/layouts/components/AppNavbar.vue -->
<template>
  <div class="app-navbar">
    <!-- 左侧 Logo -->
    <div class="navbar-left">
      <div class="logo" @click="router.push('/')">
        <span class="logo-icon">🌾</span>
        <span class="logo-text">麦袋</span>
      </div>
    </div>
    
    <!-- 中间导航 -->
    <div class="navbar-center">
      <div 
        v-for="item in navItems" 
        :key="item.key"
        class="nav-item" 
        :class="{ active: activeNav === item.key }"
        @click="router.push(item.path)"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <span>{{ item.label }}</span>
      </div>
    </div>
    
    <!-- 右侧操作区 -->
    <div class="navbar-right">
      <!-- 管理入口 -->
      <el-dropdown trigger="click" class="admin-dropdown">
        <div class="admin-trigger">
          <el-icon><Setting /></el-icon>
          <span>管理</span>
          <el-icon class="arrow"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="item in adminNavItems" :key="item.key" @click="router.push(item.path)">
              <el-icon><component :is="item.icon" /></el-icon>
              {{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 用户菜单 -->
      <el-dropdown>
        <span class="user-trigger">
          <el-avatar :size="32" class="user-avatar">{{ avatarText }}</el-avatar>
          <span class="username">{{ username }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人信息</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { NAV_ITEMS, ADMIN_NAV_ITEMS } from '@/constants/nav'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const navItems = NAV_ITEMS
const adminNavItems = ADMIN_NAV_ITEMS

const activeNav = computed(() => route.meta?.navKey || 'home')
const username = computed(() => userStore.username || '用户')
const avatarText = computed(() => username.value.charAt(0).toUpperCase())

const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}
</script>

<style scoped lang="scss">
.app-navbar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
}

.navbar-left, .navbar-center, .navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  .logo-icon {
    font-size: 24px;
  }
  
  .logo-text {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: all 0.2s;
  
  &:hover {
    background: #f5f7fa;
    color: #409eff;
  }
  
  &.active {
    background: #ecf5ff;
    color: #409eff;
    font-weight: 500;
  }
}

.admin-trigger, .user-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: background 0.2s;
  
  &:hover {
    background: #f5f7fa;
  }
  
  .arrow {
    font-size: 12px;
    color: #909399;
  }
}

.user-avatar {
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: #fff;
  font-weight: 500;
}

.username {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
```

### 3.5 状态管理设计

```javascript
// src/stores/user.js
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
    // 初始化（从 localStorage 恢复）
    initUser() {
      try {
        const stored = localStorage.getItem(AUTH_KEY)
        if (!stored) return false
        
        const info = JSON.parse(stored)
        const isExpired = Date.now() - info.timeTemp > AUTH_EXPIRE
        
        if (isExpired) {
          this.clearUser()
          return false
        }
        
        this.userInfo = info
        this.isAuthenticated = true
        return true
      } catch {
        this.clearUser()
        return false
      }
    },
    
    // 登录成功后设置用户
    setUser(info) {
      const userInfo = {
        ...info,
        timeTemp: Date.now()
      }
      this.userInfo = userInfo
      this.isAuthenticated = true
      localStorage.setItem(AUTH_KEY, JSON.stringify(userInfo))
    },
    
    // 清除用户状态
    clearUser() {
      this.userInfo = null
      this.isAuthenticated = false
      localStorage.removeItem(AUTH_KEY)
    },
    
    // 登出
    async logout() {
      try {
        await logoutSync()
      } catch (e) {
        console.error('登出请求失败:', e)
      } finally {
        this.clearUser()
      }
    }
  }
})
```

```javascript
// src/stores/app.js
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebarCollapsed: false,
    theme: 'light'
  }),
  
  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    
    setTheme(theme) {
      this.theme = theme
    }
  },
  
  persist: {
    paths: ['sidebarCollapsed', 'theme']
  }
})
```

```javascript
// src/stores/index.js
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia
```

### 3.6 API 模块化设计

```javascript
// src/api/modules/auth.js
import http from '@/utils/request'

export const loginSync = (data) => http.post('/api/users/login', data)
export const logoutSync = () => http.get('/api/users/logout')
export const registerSync = (data) => http.post('/api/users/register', data)
```

```javascript
// src/api/modules/diary.js
import http from '@/utils/request'

export const getDiaryList = (params) => http.get('/api/diary/list', { params })
export const getDiaryDetail = (id, userId) => http.get(`/api/diary/${id}`, { params: { userId } })
export const createDiary = (data) => http.post('/api/diary/create', data)
export const updateDiary = (id, userId, data) => http.put(`/api/diary/${id}?userId=${userId}`, data)
export const deleteDiary = (id, userId) => http.delete(`/api/diary/${id}?userId=${userId}`)
export const getDiaryMoodStats = (params) => http.get('/api/diary/stats/mood', { params })
export const getDiaryCalendar = (params) => http.get('/api/diary/calendar', { params })
export const getDiaryStreak = (userId) => http.get('/api/diary/streak', { params: { userId } })
```

```javascript
// src/api/modules/dashboard.js
import http from '@/utils/request'

// 获取首页概览数据
export const getDashboardOverview = (userId) => {
  return http.get('/api/dashboard/overview', { params: { userId } })
}

// 获取最近动态
export const getRecentActivities = (userId, limit = 10) => {
  return http.get('/api/dashboard/activities', { params: { userId, limit } })
}
```

```javascript
// src/api/index.js
// 统一导出所有 API
export * from './modules/auth'
export * from './modules/user'
export * from './modules/diary'
export * from './modules/photos'
export * from './modules/finance'
export * from './modules/quiz'
export * from './modules/dashboard'
```

### 3.7 常量配置

```javascript
// src/constants/nav.js

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
  { key: 'quiz', path: '/admin/quiz', label: '题库管理', icon: 'Collection' },
  { key: 'photos', path: '/admin/photos', label: '照片管理', icon: 'Picture' },
  { key: 'finance', path: '/admin/finance', label: '财务管理', icon: 'Coin' },
  { key: 'system', path: '/admin/system', label: '系统管理', icon: 'Setting' }
]
```

---

## 4. 迁移方案 (Migration Plan)

### 4.1 文件迁移对照表

| 旧路径 | 新路径 | 类型 |
|-------|--------|------|
| `views/Index.vue` | `views/home/Index.vue` | 重构 |
| `views/login/index.vue` | `views/auth/Login.vue` | 移动 |
| `views/index-cat/Index.vue` | `views/photos/Index.vue` | 移动+重命名 |
| `views/index-finance/Index.vue` | `views/finance/Index.vue` | 移动 |
| `views/index-quiz/Index.vue` | `views/study/Index.vue` | 移动+重命名 |
| `views/index-quiz-wrong/Index.vue` | `views/study/Wrong.vue` | 移动 |
| `views/index-quiz-favorites/Index.vue` | `views/study/Favorites.vue` | 移动 |
| `views/diary/Index.vue` | `views/diary/Index.vue` | 保留 |
| `views/quiz/AdminCategory.vue` | `views/admin/quiz/Categories.vue` | 移动 |
| `views/quiz/AdminQuestion.vue` | `views/admin/quiz/Questions.vue` | 移动 |
| `views/cat/CatType.vue` | `views/admin/photos/Types.vue` | 移动 |
| `views/cat/CatInfo.vue` | `views/admin/photos/List.vue` | 移动 |
| `views/finance/FinancePurpose.vue` | `views/admin/finance/Purpose.vue` | 移动 |
| `views/finance/FinanceBudget.vue` | `views/admin/finance/Budget.vue` | 移动 |
| `views/finance/FinanceRecord.vue` | `views/admin/finance/Records.vue` | 移动 |
| `views/system/User.vue` | `views/admin/system/Users.vue` | 移动 |
| `views/system/Role.vue` | `views/admin/system/Roles.vue` | 移动 |
| `layout/Layout.vue` | `layouts/AdminLayout.vue` | 移动+重构 |
| `components/Navbar.vue` | `layouts/components/AppNavbar.vue` | 移动+重构 |
| `components/Sidebar.vue` | `layouts/components/AdminSidebar.vue` | 移动 |
| `components/Breadcrumb.vue` | `layouts/components/Breadcrumb.vue` | 移动 |
| `store.js` | `stores/user.js` + `stores/app.js` | 重构+拆分 |
| `api/index.js` | `api/modules/*.js` | 重构+拆分 |

### 4.2 路由迁移对照表

| 旧路由 | 新路由 | 兼容处理 |
|-------|--------|---------|
| `/` | `/` | 内容重设计 |
| `/index-diary` | `/diary` | 重定向 |
| `/index-cat` | `/photos` | 重定向 |
| `/index-finance` | `/finance` | 重定向 |
| `/index-quiz` | `/study` | 重定向 |
| `/index-quiz-wrong` | `/study/wrong` | 重定向 |
| `/index-quiz-favorites` | `/study/favorites` | 重定向 |
| `/quiz-admin/*` | `/admin/quiz/*` | 重定向 |
| `/cat/*` | `/admin/photos/*` | 重定向 |
| `/finance/*` | `/admin/finance/*` | 重定向 |
| `/system/*` | `/admin/system/*` | 重定向 |

### 4.3 分阶段实施计划

```
┌─────────────────────────────────────────────────────────────────┐
│                       实施阶段规划                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1           Phase 2           Phase 3           Phase 4  │
│  快速修复          基础架构          路由迁移          首页重设计 │
│  1-2天            2-3天            2-3天            3-4天       │
│  ━━━━━━━━         ━━━━━━━━         ━━━━━━━━         ━━━━━━━━    │
│                                                                 │
│  • 导航命名修改     • 创建 layouts   • 路由模块化       • 新首页设计 │
│  • 管理下拉菜单     • 创建 stores    • 视图文件迁移     • 快速操作   │
│  • 首页快速入口     • API 模块化     • 旧路由重定向     • 本周概览   │
│  • 激活状态修复     • 常量配置       • 导入路径更新     • 最近动态   │
│                                                                 │
│  风险: 低          风险: 低         风险: 中          风险: 中    │
│  影响: 小          影响: 小         影响: 中          影响: 大    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Phase 1: 快速修复（1-2天）

| 任务 | 文件 | 工作量 | 优先级 |
|------|------|--------|--------|
| 导航"宠物"改"照片墙" | `Navbar.vue` | 5min | P0 |
| 导航"做题"改"学习" | `Navbar.vue` | 5min | P0 |
| 管理入口改下拉菜单 | `Navbar.vue` | 1h | P0 |
| 首页添加各模块快速入口 | `Index.vue` | 30min | P1 |
| 导航激活状态优化 | `Navbar.vue` | 30min | P1 |

#### Phase 2: 基础架构（2-3天）

| 任务 | 文件 | 工作量 | 优先级 |
|------|------|--------|--------|
| 创建 layouts 目录结构 | `layouts/*.vue` | 2h | P0 |
| 创建 AppLayout 组件 | `AppLayout.vue` | 1h | P0 |
| 创建 AppNavbar 组件 | `AppNavbar.vue` | 2h | P0 |
| 重构 stores 模块 | `stores/*.js` | 2h | P0 |
| API 模块化拆分 | `api/modules/*.js` | 2h | P1 |
| 创建导航常量配置 | `constants/nav.js` | 30min | P1 |

#### Phase 3: 路由迁移（2-3天）

| 任务 | 文件 | 工作量 | 优先级 |
|------|------|--------|--------|
| 创建路由模块结构 | `router/modules/*.js` | 1h | P0 |
| 迁移用户功能路由 | `app.routes.js` | 1h | P0 |
| 迁移管理后台路由 | `admin.routes.js` | 1h | P0 |
| 添加路由守卫 | `guards.js` | 1h | P0 |
| 添加旧路由重定向 | `index.js` | 30min | P0 |
| 迁移视图文件 | `views/**/*.vue` | 3h | P0 |
| 更新组件导入路径 | 各组件 | 2h | P1 |

#### Phase 4: 首页重设计（3-4天）

| 任务 | 文件 | 工作量 | 优先级 |
|------|------|--------|--------|
| 创建首页组件结构 | `views/home/` | 1h | P0 |
| 实现欢迎语组件 | `WelcomeHeader.vue` | 1h | P1 |
| 实现快速操作卡片 | `QuickActions.vue` | 2h | P0 |
| 实现本周概览组件 | `WeeklyOverview.vue` | 3h | P1 |
| 实现最近动态组件 | `RecentActivities.vue` | 4h | P1 |
| Dashboard API 开发 | 后端 | 4h | P1 |
| 首页样式优化 | CSS | 2h | P2 |

---

## 5. 风险与应对 (Risks & Mitigation)

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|---------|
| 旧书签/链接失效 | 高 | 中 | 添加旧路由重定向，保留6个月 |
| 组件引用路径错误 | 中 | 中 | 使用 `@/` 别名，IDE 批量替换 |
| 样式冲突或丢失 | 中 | 中 | 提取公共样式，逐步迁移验证 |
| Store 状态丢失 | 低 | 高 | 迁移前备份，分步骤验证 |
| 构建失败 | 中 | 高 | 每个阶段完成后构建验证 |
| API 导入错误 | 中 | 中 | 保持 index.js 统一导出 |

---

## 6. 验收标准 (Acceptance Criteria)

### Phase 1 验收

- [ ] 导航 Tab 显示为：首页、日记、照片墙、财务、学习
- [ ] 点击设置图标显示管理下拉菜单，包含4个管理入口
- [ ] 首页显示各模块快捷入口按钮
- [ ] 各模块页面导航 Tab 正确高亮

### Phase 2 验收

- [ ] `layouts/` 目录结构创建完成
- [ ] AppLayout 包含 AppNavbar + router-view
- [ ] stores 模块化完成，userStore 包含完整用户状态
- [ ] API 按模块拆分，index.js 统一导出正常

### Phase 3 验收

- [ ] 新路由 `/diary`, `/photos`, `/finance`, `/study` 正常访问
- [ ] 管理后台路由 `/admin/*` 正常访问
- [ ] 旧路由自动重定向到新路由
- [ ] 路由守卫正常工作，未登录跳转登录页

### Phase 4 验收

- [ ] 新首页展示欢迎语和日期
- [ ] 快速操作卡片显示各模块入口和摘要数据
- [ ] 本周概览显示各模块统计数据
- [ ] 最近动态显示各模块活动记录
- [ ] 移动端响应式正常显示

---

## 7. 附录 (Appendices)

### A. 技术栈确认

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.x | 前端框架 |
| Vue Router | 4.x | 路由管理 |
| Pinia | 2.x | 状态管理 |
| Element Plus | 2.x | UI 组件库 |
| Axios | 1.x | HTTP 请求 |
| Sass | - | CSS 预处理 |
| ECharts | 5.x | 图表库 |

### B. 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `DiaryList.vue` |
| 视图文件 | PascalCase | `Index.vue` |
| 路由命名 | PascalCase | `name: 'StudyWrong'` |
| 路由路径 | kebab-case | `/study/wrong` |
| Store 模块 | camelCase | `useUserStore` |
| API 函数 | camelCase | `getDiaryList` |
| 常量 | UPPER_SNAKE_CASE | `NAV_ITEMS` |

### C. 目录规范

| 目录 | 用途 | 规范 |
|------|------|------|
| `api/` | API 接口 | 按业务模块拆分 |
| `components/` | 通用组件 | 可复用，无业务耦合 |
| `constants/` | 常量配置 | 纯数据，无逻辑 |
| `layouts/` | 布局组件 | 页面骨架结构 |
| `router/` | 路由配置 | 按用途模块拆分 |
| `stores/` | 状态管理 | 按业务领域拆分 |
| `styles/` | 全局样式 | 变量、混入、公共样式 |
| `utils/` | 工具函数 | 纯函数，无副作用 |
| `views/` | 页面视图 | 按功能模块组织 |

---

*— End of Document —*

*— Winston | Architect —*

