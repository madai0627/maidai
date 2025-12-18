# 代码修复清单
## Phase 1-4 质量审查后的必须修复项

> 📅 创建日期: 2024-12-17  
> 👤 审查人: Quinn (QA Agent)  
> 🎯 优先级: P0 - 必须修复

---

## 🔴 严重问题（必须立即修复）

### 1. 删除遗留路由文件 ⚠️⚠️⚠️

**问题：** `frontend/src/router.js` 文件仍然存在，会导致路由配置冲突  
**影响：** 新路由配置可能不生效，系统无法正常工作  
**修复：** 删除 `frontend/src/router.js` 文件

**验证：**
```bash
# 确认文件已删除
ls frontend/src/router.js  # 应该返回文件不存在
```

---

### 2. 删除遗留 Store 文件 ⚠️⚠️

**问题：** `frontend/src/store.js` 文件仍然存在，可能导致状态管理混乱  
**影响：** 可能被误导入，导致状态不一致  
**修复：** 删除 `frontend/src/store.js` 文件

**验证：**
- 搜索代码中是否还有 `import ... from '@/store'` 的引用
- 确认所有引用已更新为 `@/stores/user` 或 `@/stores/app`

---

### 3. 修复管理后台路由结构 ⚠️⚠️⚠️

**问题：** `admin.routes.js` 中路由对象包含 `children`，Vue Router 不支持这种结构  
**影响：** 管理后台路由可能无法正常工作  
**修复：** 重构路由结构

**当前错误结构：**
```javascript
{
  path: 'quiz',
  redirect: '/admin/quiz/categories',
  children: [...]  // ❌ 错误：children 不能在这里
}
```

**正确结构：**
```javascript
// 方案1：扁平化结构（推荐）
{
  path: 'quiz/categories',
  name: 'QuizAdminCategory',
  component: () => import('@/views/quiz/AdminCategory.vue'),
  meta: { title: '分类管理', icon: 'Folder' }
},
{
  path: 'quiz/questions',
  name: 'QuizAdminQuestion',
  component: () => import('@/views/quiz/AdminQuestion.vue'),
  meta: { title: '题目管理', icon: 'Document' }
}

// 方案2：在 router/index.js 中正确嵌套
{
  path: '/admin',
  component: AdminLayout,
  children: [
    {
      path: 'quiz',
      redirect: '/admin/quiz/categories',
      children: [
        { path: 'categories', ... },
        { path: 'questions', ... }
      ]
    }
  ]
}
```

---

### 4. 移除用户页面中的 Navbar ⚠️⚠️

**问题：** 6个用户功能页面仍包含 `<Navbar />` 组件，但 AppLayout 已提供 AppNavbar  
**影响：** 页面会显示两个导航栏，影响用户体验  
**修复：** 移除以下文件中的 Navbar 组件和布局容器

**需要修复的文件：**
1. `frontend/src/views/diary/Index.vue`
2. `frontend/src/views/index-quiz/Index.vue`
3. `frontend/src/views/index-quiz-wrong/Index.vue`
4. `frontend/src/views/index-quiz-favorites/Index.vue`
5. `frontend/src/views/index-cat/Index.vue`
6. `frontend/src/views/index-finance/Index.vue`

**修复步骤：**
1. 移除 `<Navbar />` 组件导入
2. 移除 `<Navbar />` 组件使用
3. 移除 `<el-container>`, `<el-header>`, `<el-main>` 等布局容器
4. 保留页面内容部分

**示例修复：**
```vue
<!-- 修复前 -->
<template>
  <Navbar />
  <el-container>
    <el-main>
      <!-- 页面内容 -->
    </el-main>
  </el-container>
</template>

<!-- 修复后 -->
<template>
  <div class="page-content">
    <!-- 页面内容 -->
  </div>
</template>
```

---

### 5. 更新导航路径 ⚠️

**问题：** 导航配置中使用旧路径（`/index-diary`），应使用新路径（`/diary`）  
**影响：** 导航跳转使用旧路由，不符合新架构  
**修复：** 更新 `constants/nav.js` 中的路径

**需要更新的路径：**
- `/index-diary` → `/diary`
- `/index-cat` → `/photos`
- `/index-finance` → `/finance`
- `/index-quiz` → `/study`

---

## 🟡 中等问题（应该修复）

### 6. 更新 AppNavbar 中的路由路径

**问题：** AppNavbar 组件中可能仍使用旧路径  
**修复：** 检查并更新 `layouts/components/AppNavbar.vue` 中的路径

---

### 7. 启用 Stores 持久化

**问题：** app.js 中配置了 persist，但 stores/index.js 中未启用插件  
**修复：**
1. 安装 `pinia-plugin-persistedstate`
2. 在 `stores/index.js` 中启用插件

```javascript
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
pinia.use(piniaPluginPersistedstate)
```

---

### 8. 创建 404 页面

**问题：** 路由中引用了 404 页面，但文件可能不存在  
**修复：** 创建 `views/error/404.vue` 或使用合适的 fallback

---

## ✅ 修复验证清单

修复完成后，请验证：

- [ ] 删除 `router.js` 后，应用仍能正常启动
- [ ] 删除 `store.js` 后，无导入错误
- [ ] 管理后台路由 `/admin/*` 正常访问
- [ ] 用户功能页面只显示一个导航栏
- [ ] 导航路径使用新路由
- [ ] 所有旧路由重定向正常
- [ ] 无控制台错误
- [ ] 功能测试通过

---

*— End of Checklist —*

