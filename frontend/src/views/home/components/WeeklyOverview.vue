<!--
  本周概览组件
  显示各模块的本周统计数据
-->
<template>
  <el-card class="weekly-overview" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="header-icon">📊</span>
        <span class="header-title">本周概览</span>
      </div>
    </template>
    
    <div class="overview-content" v-if="!loading">
      <div 
        v-for="item in statsItems" 
        :key="item.key"
        class="stat-item"
        :class="`theme-${item.theme}`"
      >
        <div class="module-name">{{ item.name }}</div>
        <div class="divider"></div>
        <div class="stat-value">{{ item.count }}</div>
        <div class="stat-label">{{ item.label }}</div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div class="overview-content loading" v-else>
      <el-skeleton :rows="4" animated />
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  overview: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 统计数据项
const statsItems = computed(() => {
  const overview = props.overview || {}
  
  return [
    {
      key: 'diary',
      name: '日记',
      count: `${overview.diary?.weekCount || 0} 篇`,
      label: `连续${overview.diary?.streak || 0}天`,
      theme: 'blue'
    },
    {
      key: 'photos',
      name: '照片墙',
      count: `+${overview.photos?.weekAdded || 0} 张`,
      label: '本周新增',
      theme: 'green'
    },
    {
      key: 'finance',
      name: '财务',
      count: `${overview.finance?.weekRecords || 0} 笔`,
      label: `支出¥${(overview.finance?.weekExpense || 0).toLocaleString()}`,
      theme: 'orange'
    },
    {
      key: 'study',
      name: '学习',
      count: `${overview.study?.weekCount || 0} 题`,
      label: `正确率 ${overview.study?.weekAccuracy || '0%'}`,
      theme: 'gray'
    }
  ]
})
</script>

<style scoped lang="scss">
.weekly-overview {
  border-radius: 12px;
  margin-bottom: 24px;
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

.overview-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  
  &.loading {
    gap: 24px;
  }
}

.stat-item {
  text-align: center;
  
  .module-name {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
    margin-bottom: 8px;
  }
  
  .divider {
    width: 40px;
    height: 2px;
    margin: 8px auto;
    background: var(--theme-color, #409eff);
  }
  
  &.theme-blue .divider {
    background: #409eff;
  }
  
  &.theme-green .divider {
    background: #67c23a;
  }
  
  &.theme-orange .divider {
    background: #e6a23c;
  }
  
  &.theme-gray .divider {
    background: #909399;
  }
  
  .stat-value {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 12px;
    color: #909399;
  }
}

@media (max-width: 768px) {
  .overview-content {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media (min-width: 769px) and (max-width: 991px) {
  .overview-content {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}
</style>

