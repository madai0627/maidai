<!--
  个人中心首页
  展示所有模块的概览和快捷入口
-->
<template>
  <div class="home-page">
    <div class="home-container">
      <!-- 欢迎语 -->
      <WelcomeHeader />
      
      <!-- 快速操作卡片 -->
      <QuickActions 
        :overview="overview" 
        :loading="loading"
      />
      
      <!-- 本周概览 -->
      <WeeklyOverview 
        :overview="overview" 
        :loading="loading"
      />
      
      <!-- 最近动态 -->
      <RecentActivities 
        :activities="activities" 
        :loading="loading"
        :has-more="hasMore"
        @load-more="handleLoadMore"
      />
      
      <!-- 错误提示 -->
      <el-alert
        v-if="error"
        :title="error"
        type="error"
        :closable="true"
        @close="error = null"
        show-icon
        style="margin-top: 24px;"
      >
        <template #default>
          <div>
            <p>{{ error }}</p>
            <el-button size="small" type="primary" @click="loadHomeData" style="margin-top: 8px;">
              重试
            </el-button>
          </div>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getDashboardOverview, getRecentActivities } from '@/api/modules/dashboard'
import WelcomeHeader from './components/WelcomeHeader.vue'
import QuickActions from './components/QuickActions.vue'
import WeeklyOverview from './components/WeeklyOverview.vue'
import RecentActivities from './components/RecentActivities.vue'

const userStore = useUserStore()
const route = useRoute()

// 数据状态
const overview = ref({})
const activities = ref([])
const loading = ref(false)
const error = ref(null)
const hasMore = ref(false)

// 上次刷新时间，用于避免频繁刷新
const lastRefreshTime = ref(0)
const REFRESH_INTERVAL = 5000 // 5秒内不重复刷新

// 加载首页数据
const loadHomeData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const userId = userStore.userId
    if (!userId) {
      error.value = '用户未登录，请先登录'
      loading.value = false
      return
    }
    
    // 并行加载概览数据和最近动态
    const [overviewRes, activitiesRes] = await Promise.all([
      getDashboardOverview(userId).catch(err => {
        // 如果是 404 错误（后端 API 未实现），静默处理，使用默认值
        if (err.response?.status === 404) {
          console.warn('Dashboard API 未实现，使用默认值')
          return null
        }
        console.error('加载概览数据失败:', err)
        return null
      }),
      getRecentActivities(userId, 10).catch(err => {
        // 如果是 404 错误（后端 API 未实现），静默处理，使用空数组
        if (err.response?.status === 404) {
          console.warn('Activities API 未实现，使用空数组')
          return null
        }
        console.error('加载最近动态失败:', err)
        return null
      })
    ])
    
    // 处理概览数据
    if (overviewRes && overviewRes.code === 0) {
      overview.value = overviewRes.data || overviewRes
    } else if (overviewRes) {
      // 如果后端返回格式不同，尝试直接使用
      overview.value = overviewRes
    } else {
      // API 未实现时，使用空对象，组件会显示默认值
      overview.value = {}
    }
    
    // 处理最近动态
    if (activitiesRes && activitiesRes.code === 0) {
      activities.value = activitiesRes.data || activitiesRes
    } else if (activitiesRes) {
      activities.value = Array.isArray(activitiesRes) ? activitiesRes : (activitiesRes.data || [])
    } else {
      // API 未实现时，使用空数组，组件会显示空状态
      activities.value = []
    }
    
    // 判断是否有更多数据
    hasMore.value = activities.value.length >= 10
    
    // 更新最后刷新时间
    lastRefreshTime.value = Date.now()
    
    // 只有在非 404 错误时才显示错误提示
    // 404 错误表示后端 API 未实现，这是预期的，不需要显示错误
  } catch (err) {
    // 只有在非 404 错误时才显示错误提示
    if (err.response?.status !== 404) {
      console.error('加载首页数据失败:', err)
      error.value = err.message || '加载数据失败，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

// 加载更多动态
const handleLoadMore = async () => {
  try {
    const userId = userStore.userId
    if (!userId) return
    const limit = activities.value.length + 10
    const res = await getRecentActivities(userId, limit).catch(err => {
      // 如果是 404 错误（后端 API 未实现），静默处理
      if (err.response?.status === 404) {
        console.warn('Activities API 未实现')
        return null
      }
      throw err
    })
    
    if (res && res.code === 0) {
      activities.value = res.data || res
    } else if (res) {
      activities.value = Array.isArray(res) ? res : (res.data || [])
    }
    
    hasMore.value = activities.value.length >= limit
  } catch (err) {
    // 只有在非 404 错误时才记录错误
    if (err.response?.status !== 404) {
      console.error('加载更多动态失败:', err)
    }
  }
}

// 初始化
onMounted(() => {
  loadHomeData()
})

// 页面激活时刷新数据（从其他页面返回时）
onActivated(() => {
  // 移除防抖限制，确保数据实时更新
  loadHomeData()
})

// 监听路由变化，从其他页面返回时刷新
watch(() => route.path, (newPath, oldPath) => {
  // 如果从其他页面导航到个人中心，刷新数据
  if (newPath === '/' && oldPath && oldPath !== '/') {
    // 移除防抖限制，确保数据实时更新
    loadHomeData()
  }
}, { immediate: false })
</script>

<style scoped lang="scss">
.home-page {
  width: 100%;
  min-height: calc(100vh - 60px);
}

.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

@media (max-width: 768px) {
  .home-container {
    padding: 0 16px;
  }
}
</style>

