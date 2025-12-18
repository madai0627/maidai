<!--
  欢迎语组件
  显示个性化欢迎语和当前日期
-->
<template>
  <div class="welcome-header">
    <h1 class="greeting">👋 你好，{{ username }}！</h1>
    <p class="date-info">{{ dateText }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const username = computed(() => userStore.username || '用户')

// 格式化日期
const dateText = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekday = weekdays[now.getDay()]
  
  return `今天是 ${year}年${month}月${day}日 ${weekday}`
})
</script>

<style scoped lang="scss">
.welcome-header {
  margin-bottom: 24px;
  
  .greeting {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
    line-height: 1.4;
  }
  
  .date-info {
    font-size: 14px;
    color: #909399;
    margin: 0;
    line-height: 1.5;
  }
}

@media (max-width: 768px) {
  .welcome-header {
    .greeting {
      font-size: 20px;
    }
    
    .date-info {
      font-size: 12px;
    }
  }
}
</style>

