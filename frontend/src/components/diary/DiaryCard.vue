<template>
  <div 
    class="diary-card" 
    :style="{ '--mood-color': moodInfo.color }"
    @click="$emit('view', diary)"
  >
    <!-- 左侧情绪色条 -->
    <div class="mood-bar"></div>
    
    <div class="card-content">
      <!-- 头部：日期 + 情绪 -->
      <div class="card-header">
        <div class="date-info">
          <span class="mood-emoji">{{ moodInfo.emoji }}</span>
          <span class="mood-label">{{ moodInfo.label }}</span>
          <span class="date-text">{{ formattedDate }}</span>
        </div>
        <div class="card-actions" @click.stop>
          <el-button text size="small" @click="$emit('edit', diary)">
            <el-icon><Edit /></el-icon>
          </el-button>
          <el-button text size="small" type="danger" @click="handleDelete">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
      
      <!-- 标题（可选） -->
      <div class="card-title" v-if="diary.title">{{ diary.title }}</div>
      
      <!-- 内容预览 -->
      <div class="card-preview">{{ contentPreview }}</div>
      
      <!-- 图片缩略图 -->
      <div class="card-images" v-if="diary.images && diary.images.length">
        <div 
          v-for="(img, idx) in displayImages" 
          :key="idx" 
          class="thumb-item"
          @click.stop="previewImage(idx)"
        >
          <img :src="img" alt="diary image" />
          <div class="more-overlay" v-if="idx === 2 && diary.images.length > 3">
            +{{ diary.images.length - 3 }}
          </div>
        </div>
      </div>
      
      <!-- 标签 -->
      <div class="card-tags" v-if="diary.tags && diary.tags.length">
        <el-tag 
          v-for="tag in diary.tags.slice(0, 5)" 
          :key="tag" 
          size="small"
          effect="plain"
        >
          {{ tag }}
        </el-tag>
        <el-tag v-if="diary.tags.length > 5" size="small" type="info">
          +{{ diary.tags.length - 5 }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getMoodInfo, formatDiaryDate } from '@/constants/diary.js'

const props = defineProps({
  diary: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view', 'edit', 'delete'])

// 情绪信息
const moodInfo = computed(() => getMoodInfo(props.diary.mood))

// 格式化日期
const formattedDate = computed(() => formatDiaryDate(props.diary.diary_date))

// 内容预览（最多100字）
const contentPreview = computed(() => {
  const content = props.diary.content || ''
  return content.length > 100 ? content.slice(0, 100) + '...' : content
})

// 显示的图片（最多3张）
const displayImages = computed(() => {
  return (props.diary.images || []).slice(0, 3)
})

// 删除确认
const handleDelete = () => {
  ElMessageBox.confirm('确定要删除这篇日记吗？', '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('delete', props.diary)
  }).catch(() => {})
}

// 图片预览
const previewImage = (idx) => {
  // 可以使用 el-image-viewer 或自定义预览
  emit('view', props.diary)
}
</script>

<style scoped>
.diary-card {
  display: flex;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
}

.diary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--mood-color);
}

/* 左侧情绪色条 */
.mood-bar {
  width: 6px;
  background: var(--mood-color);
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  padding: 16px;
  min-width: 0;
}

/* 头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mood-emoji {
  font-size: 20px;
}

.mood-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--mood-color);
}

.date-text {
  font-size: 13px;
  color: #909399;
}

.card-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.diary-card:hover .card-actions {
  opacity: 1;
}

/* 标题 */
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 内容预览 */
.card-preview {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 图片缩略图 */
.card-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.thumb-item {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.more-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
}

/* 标签 */
.card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.card-tags .el-tag {
  border-radius: 4px;
}

/* 响应式 */
@media (max-width: 768px) {
  .card-content {
    padding: 12px;
  }
  
  .thumb-item {
    width: 60px;
    height: 60px;
  }
  
  .card-actions {
    opacity: 1;
  }
}
</style>

