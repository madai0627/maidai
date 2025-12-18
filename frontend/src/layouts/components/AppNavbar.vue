<!--
  用户功能导航栏组件
  用于 AppLayout，提供顶部导航功能
-->
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
        :class="{ active: isNavActive(item.key) }"
        @click="router.push(item.path)"
      >
        <el-icon><component :is="iconMap[item.icon] || item.icon" /></el-icon>
        <span>{{ item.label }}</span>
      </div>
    </div>
    
    <!-- 右侧操作区 -->
    <div class="navbar-right">
      <!-- 管理入口下拉菜单 -->
      <el-dropdown trigger="click" class="admin-dropdown">
        <div class="admin-trigger">
          <el-icon><Setting /></el-icon>
          <span class="admin-text">管理</span>
          <el-icon class="arrow"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item 
              v-for="item in adminNavItems" 
              :key="item.key" 
              @click="router.push(item.path)"
            >
              <el-icon><component :is="iconMap[item.icon] || item.icon" /></el-icon>
              <span style="margin-left: 8px;">{{ item.label }}</span>
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
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { NAV_ITEMS, ADMIN_NAV_ITEMS } from '@/constants/nav'
import { 
  House, Notebook, Picture, Coin, Reading, 
  Setting, ArrowDown, Collection 
} from '@element-plus/icons-vue'

// 图标映射（因为 Element Plus 图标是字符串名称）
const iconMap = {
  House,
  Notebook,
  Picture,
  Coin,
  Reading,
  Setting,
  ArrowDown,
  Collection
}

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 导航配置
const navItems = NAV_ITEMS
const adminNavItems = ADMIN_NAV_ITEMS

// 导航激活状态判断
const getActiveNavKey = (routeName) => {
  if (!routeName) return ''
  
  if (routeName === 'Index') return 'home'
  if (routeName === 'IndexDiary') return 'diary'
  if (routeName === 'IndexCat') return 'photos'
  if (routeName === 'IndexFinance') return 'finance'
  if (routeName && (
    routeName === 'IndexQuiz' || 
    routeName === 'IndexQuizDo' || 
    routeName === 'IndexQuizWrong' || 
    routeName === 'IndexQuizFavorites'
  )) {
    return 'study'
  }
  
  return ''
}

// 判断导航项是否激活
const isNavActive = (navKey) => {
  return getActiveNavKey(route.name) === navKey
}

// 用户信息
const username = computed(() => userStore.username || '用户')
const avatarText = computed(() => username.value.charAt(0).toUpperCase())

// 初始化用户状态
onMounted(() => {
  if (!userStore.isAuthenticated) {
    userStore.initUser()
  }
})

// 登出处理
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
  border-bottom: 1px solid #e6e6e6;
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
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
  
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

.admin-dropdown {
  margin-right: 8px;
}

.admin-trigger {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.2s;
  font-size: 14px;
  color: #606266;
  
  &:hover {
    background: #f5f7fa;
  }
  
  .admin-text {
    font-size: 14px;
  }
  
  .arrow {
    font-size: 12px;
    color: #909399;
  }
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
  
  &:hover {
    background: #f5f7fa;
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
  font-size: 14px;
  color: #606266;
}
</style>

