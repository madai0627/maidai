<!--
  最近动态组件
  显示各模块的最近活动时间线
-->
<template>
  <el-card class="recent-activities" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="header-icon">📅</span>
        <span class="header-title">最近动态</span>
      </div>
    </template>
    
    <div class="activities-content" v-if="!loading && activities.length > 0">
      <div 
        v-for="(activity, index) in activities" 
        :key="activity.id || index"
        class="activity-item"
        :class="`theme-${getActivityTheme(activity.type)}`"
        @click="handleActivityClick(activity)"
      >
        <div class="timeline-node"></div>
        <div class="activity-content">
          <div class="activity-time">{{ activity.time }}</div>
          <div class="activity-text">
            <span class="activity-icon">{{ getActivityIcon(activity.type) }}</span>
            <span>{{ activity.title }}</span>
            <el-link 
              v-if="activity.actionText" 
              type="primary" 
              class="action-link"
              @click.stop="handleActionClick(activity)"
            >
              {{ activity.actionText }}
            </el-link>
          </div>
        </div>
      </div>
      
      <div class="more-actions" v-if="hasMore">
        <el-button text type="primary" @click="handleLoadMore">
          查看更多动态
        </el-button>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div class="activities-content loading" v-else-if="loading">
      <el-skeleton :rows="5" animated />
    </div>
    
    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <el-icon class="empty-icon" :size="48"><Clock /></el-icon>
      <p class="empty-text">暂无动态</p>
      <p class="empty-subtext">开始使用各模块功能，动态会显示在这里</p>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Clock } from '@element-plus/icons-vue'

const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['load-more'])

const router = useRouter()

// 获取活动类型主题色
const getActivityTheme = (type) => {
  const themeMap = {
    diary: 'blue',
    photos: 'green',
    finance: 'orange',
    study: 'gray'
  }
  return themeMap[type] || 'blue'
}

// 获取活动图标
const getActivityIcon = (type) => {
  const iconMap = {
    diary: '📔',
    photos: '🖼️',
    finance: '💰',
    study: '📚'
  }
  return iconMap[type] || '📝'
}

// 处理活动点击
const handleActivityClick = (activity) => {
  if (activity.actionUrl) {
    router.push(activity.actionUrl)
  }
}

// 处理操作链接点击
const handleActionClick = (activity) => {
  if (activity.actionUrl) {
    router.push(activity.actionUrl)
  }
}

// 加载更多
const handleLoadMore = () => {
  emit('load-more')
}
</script>

<style scoped lang="scss">
.recent-activities {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.header-icon {
  font-size: 24px;
}

.activities-content {
  position: relative;
  padding-left: 32px;
  
  &.loading {
    padding-left: 0;
  }
}

.activity-item {
  position: relative;
  padding-bottom: 16px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    .activity-content {
      background: #f5f7fa;
      border-radius: 8px;
      padding: 8px;
      margin: -8px;
    }
  }
  
  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: -24px;
    top: 20px;
    bottom: -16px;
    width: 2px;
    background: #e4e7ed;
  }
}

.timeline-node {
  position: absolute;
  left: -28px;
  top: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: var(--theme-color, #409eff);
  z-index: 1;
}

.theme-blue .timeline-node {
  background: #409eff;
}

.theme-green .timeline-node {
  background: #67c23a;
}

.theme-orange .timeline-node {
  background: #e6a23c;
}

.theme-gray .timeline-node {
  background: #909399;
}

.activity-content {
  padding: 4px 0;
}

.activity-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.activity-text {
  font-size: 14px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.activity-icon {
  font-size: 16px;
}

.action-link {
  margin-left: auto;
}

.more-actions {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.empty-state {
  text-align: center;
  padding: 48px 20px;
  
  .empty-icon {
    color: #c0c4cc;
    margin-bottom: 16px;
  }
  
  .empty-text {
    font-size: 16px;
    color: #606266;
    margin: 0 0 8px 0;
  }
  
  .empty-subtext {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }
}
</style>

