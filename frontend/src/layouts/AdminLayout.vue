<!--
  管理后台布局组件
  用于所有管理后台页面
  包含侧边栏、顶部导航栏、面包屑和主内容区
-->
<template>
  <el-container class="admin-layout">
    <el-aside :width="sidebarWidth" class="admin-aside">
      <AdminSidebar />
    </el-aside>
    <el-container class="admin-main-container" :class="{ collapsed: appStore.sidebarCollapsed }">
      <el-header class="admin-header">
        <AdminNavbar />
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
// 暂时使用旧的组件路径，Phase 3 路由迁移时会统一处理
import AdminSidebar from '@/components/Sidebar.vue'
import AdminNavbar from '@/components/Navbar.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

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
  background: #304156;
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
  min-height: calc(100vh - 60px);
}
</style>

