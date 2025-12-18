<template>
  <div class="navbar">
    <div class="left">
      <el-button @click="toggleSideBar" v-if="!route.name.includes('Index')">
        <el-icon>
          <Fold />
        </el-icon>
      </el-button>

      <div class="setting" @click="router.push('/')">
        <el-icon><House /></el-icon>
      </div>
    </div>
    <div class="center" v-if="route.name.includes('Index')">
      <div class="tab-item" :class="{active: isNavActive('home')}" @click="router.push('/')">个人中心</div>
      <div class="tab-item" :class="{active: isNavActive('diary')}" @click="router.push('/diary')">日记</div>
      <div class="tab-item" :class="{active: isNavActive('photos')}" @click="router.push('/photos')">照片墙</div>
      <div class="tab-item" :class="{active: isNavActive('finance')}" @click="router.push('/finance')">财务</div>
      <div class="tab-item" :class="{active: isNavActive('study')}" @click="router.push('/study')">学习</div>
    </div>
    <div class="right">
      <!-- 管理入口下拉菜单 -->
      <el-dropdown trigger="click" class="admin-dropdown">
        <div class="admin-trigger">
          <el-icon><Setting /></el-icon>
          <span class="admin-text">管理</span>
          <el-icon class="arrow"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="router.push('/admin/quiz/categories')">
              <el-icon><Collection /></el-icon>
              <span style="margin-left: 8px;">题库管理</span>
            </el-dropdown-item>
            <el-dropdown-item @click="router.push('/admin/photos/types')">
              <el-icon><Picture /></el-icon>
              <span style="margin-left: 8px;">照片管理</span>
            </el-dropdown-item>
            <el-dropdown-item @click="router.push('/admin/finance/purpose')">
              <el-icon><Coin /></el-icon>
              <span style="margin-left: 8px;">财务管理</span>
            </el-dropdown-item>
            <el-dropdown-item divided @click="router.push('/admin/system/users')">
              <el-icon><Setting /></el-icon>
              <span style="margin-left: 8px;">系统管理</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <!-- 用户下拉菜单 -->
      <el-dropdown>
        <span class="user-info">
          {{ username }}
          <el-icon class="el-icon--right">
            <ArrowDown />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人信息</el-dropdown-item>
            <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { Fold, ArrowDown, Setting, Collection, Picture, Coin, House } from '@element-plus/icons-vue'
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { logoutSync } from '@/api/modules/auth'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

// 导航激活状态判断（优化后的逻辑，便于维护）
const getActiveNavKey = (routeName) => {
  if (!routeName) return ''
  
  // 首页/个人中心
  if (routeName === 'Index') return 'home'
  
  // 日记模块
  if (routeName === 'IndexDiary') return 'diary'
  
  // 照片墙模块
  if (routeName === 'IndexCat') return 'photos'
  
  // 财务模块
  if (routeName === 'IndexFinance') return 'finance'
  
  // 学习模块（包括所有子页面）
  if (routeName && (routeName === 'IndexQuiz' || 
                    routeName === 'IndexQuizDo' || 
                    routeName === 'IndexQuizWrong' || 
                    routeName === 'IndexQuizFavorites')) {
    return 'study'
  }
  
  return ''
}

// 判断导航项是否激活
const isNavActive = (navKey) => {
  return getActiveNavKey(route.name) === navKey
}

// 侧边栏切换（管理后台使用）
const toggleSideBar = () => {
  appStore.toggleSidebar()
}

// 用户信息
const username = computed(() => userStore.username || '用户')

// 初始化用户状态
onMounted(() => {
  if (!userStore.isAuthenticated) {
    userStore.initUser()
  }
})

// 登出处理
const logout = async () => {
  await userStore.logout()
  router.push('/login')
}
</script>

<style scoped lang="scss">
.navbar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.left, .right, .center {
  display: flex;
  align-items: center;
  gap: 20px;
}

.setting {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
}

.admin-dropdown {
  margin-right: 8px;
}

.admin-trigger {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
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

.tab-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 15px;
  border-radius: 10px;
  background-color: #f0f2f5;
  font-size: 14px;
  font-weight: 500;
  color: #333;

  &.active {
    background-color: #409eff;
    color: #fff;
  }
}
</style>