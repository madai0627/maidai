<!--
  快速操作卡片组件
  显示各模块的快速入口和摘要数据
-->
<template>
  <div class="quick-actions">
    <QuickActionCard
      v-for="item in actionItems"
      :key="item.key"
      :icon="item.icon"
      :title="item.title"
      :data="item.data"
      :data-label="item.dataLabel"
      :button-text="item.buttonText"
      :theme="item.theme"
      :loading="loading"
      @click="handleAction(item)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import QuickActionCard from './QuickActionCard.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

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

// 快速操作项配置
const actionItems = computed(() => {
  const overview = props.overview || {}
  
  return [
    {
      key: 'diary',
      icon: 'Notebook',
      title: '日记',
      data: overview.diary?.todayMood || '未记录',
      dataLabel: '今日情绪',
      buttonText: '写日记',
      theme: 'blue',
      path: '/diary'
    },
    {
      key: 'photos',
      icon: 'Picture',
      title: '照片墙',
      data: `共${overview.photos?.total || 0}张`,
      dataLabel: '照片总数',
      buttonText: '上传照片',
      theme: 'green',
      path: '/photos'
    },
    {
      key: 'finance',
      icon: 'Coin',
      title: '财务',
      data: `¥${(overview.finance?.monthExpense || 0).toLocaleString()}`,
      dataLabel: '本月支出',
      buttonText: '记一笔',
      theme: 'orange',
      path: '/finance'
    },
    {
      key: 'study',
      icon: 'Reading',
      title: '学习',
      data: `${overview.study?.todayCount || 0}道`,
      dataLabel: '今日做题',
      buttonText: '继续学习',
      theme: 'gray',
      path: '/study'
    }
  ]
})

// 处理操作点击
const handleAction = (item) => {
  router.push(item.path)
}
</script>

<style scoped lang="scss">
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 991px) {
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

