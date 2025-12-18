<!--
  快速操作卡片子组件
  单个模块的快速操作卡片
-->
<template>
  <el-card 
    class="action-card" 
    shadow="hover"
    :class="`theme-${theme}`"
    @click="handleClick"
  >
    <div class="card-content">
      <!-- 图标和标题 -->
      <div class="card-header">
        <el-icon class="card-icon" :size="32">
          <component :is="iconMap[icon] || icon" />
        </el-icon>
        <h3 class="card-title">{{ title }}</h3>
      </div>
      
      <!-- 数据展示 -->
      <div class="card-data" v-if="!loading">
        <div class="data-value">{{ data }}</div>
        <div class="data-label">{{ dataLabel }}</div>
      </div>
      
      <!-- 加载状态 -->
      <div class="card-data loading" v-else>
        <el-skeleton :rows="2" animated />
      </div>
      
      <!-- 操作按钮 -->
      <el-button 
        :type="theme === 'blue' ? 'primary' : theme === 'green' ? 'success' : theme === 'orange' ? 'warning' : 'info'"
        class="action-button"
        :loading="loading"
        @click.stop="handleClick"
      >
        {{ buttonText }}
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
import { Notebook, Picture, Coin, Reading } from '@element-plus/icons-vue'

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  data: {
    type: String,
    default: '-'
  },
  dataLabel: {
    type: String,
    default: ''
  },
  buttonText: {
    type: String,
    required: true
  },
  theme: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'orange', 'gray'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const iconMap = {
  Notebook,
  Picture,
  Coin,
  Reading
}

const handleClick = () => {
  emit('click')
}
</script>

<style scoped lang="scss">
.action-card {
  min-height: 200px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.card-icon {
  color: var(--theme-color, #409eff);
}

.theme-blue .card-icon {
  color: #409eff;
}

.theme-green .card-icon {
  color: #67c23a;
}

.theme-orange .card-icon {
  color: #e6a23c;
}

.theme-gray .card-icon {
  color: #909399;
}

.card-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.card-data {
  flex: 1;
  margin-bottom: 16px;
  
  &.loading {
    margin-bottom: 0;
  }
}

.data-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.data-label {
  font-size: 12px;
  color: #909399;
}

.action-button {
  width: 100%;
  height: 32px;
}
</style>

