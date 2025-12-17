<template>
  <div class="diary-list">
    <!-- 空状态 -->
    <div class="empty-state" v-if="!loading && list.length === 0">
      <div class="empty-icon">📔</div>
      <div class="empty-title">还没有日记</div>
      <div class="empty-desc">记录每天的心情，让生活更有仪式感</div>
      <el-button type="primary" @click="$emit('create')">
        写第一篇日记
      </el-button>
    </div>

    <!-- 加载状态 -->
    <div class="loading-state" v-if="loading">
      <el-skeleton :rows="3" animated />
      <el-skeleton :rows="3" animated style="margin-top: 16px;" />
    </div>

    <!-- 日记卡片列表 -->
    <div class="card-list" v-if="!loading && list.length > 0">
      <DiaryCard
        v-for="diary in list"
        :key="diary.id"
        :diary="diary"
        @view="$emit('view', diary)"
        @edit="$emit('edit', diary)"
        @delete="$emit('delete', diary)"
      />
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > pageSize">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import DiaryCard from '@/components/diary/DiaryCard.vue'

defineProps({
  list: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    default: 0
  },
  pageSize: {
    type: Number,
    default: 10
  },
  currentPage: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['create', 'view', 'edit', 'delete', 'page-change'])

const handlePageChange = (page) => {
  emit('page-change', page)
}
</script>

<style scoped>
.diary-list {
  min-height: 400px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #909399;
  margin-bottom: 20px;
}

/* 加载状态 */
.loading-state {
  padding: 20px 0;
}

/* 卡片列表 */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-bottom: 20px;
}
</style>

