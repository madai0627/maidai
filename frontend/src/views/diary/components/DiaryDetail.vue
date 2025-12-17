<template>
  <el-dialog
    v-model="visible"
    :show-close="true"
    width="700px"
    class="diary-detail-dialog"
  >
    <template #header>
      <div class="detail-header" :style="{ '--mood-color': moodInfo.color }">
        <span class="mood-emoji-large">{{ moodInfo.emoji }}</span>
        <div class="header-info">
          <span class="mood-label">{{ moodInfo.label }}</span>
          <span class="date-text">{{ formattedDate }}</span>
        </div>
      </div>
    </template>

    <div class="detail-content" v-if="diary">
      <!-- 标题 -->
      <h2 class="diary-title" v-if="diary.title">{{ diary.title }}</h2>
      
      <!-- 正文内容 -->
      <div class="diary-body">
        <p v-for="(para, idx) in paragraphs" :key="idx">{{ para }}</p>
      </div>
      
      <!-- 图片画廊 -->
      <div class="diary-gallery" v-if="diary.images && diary.images.length">
        <div 
          v-for="(img, idx) in diary.images" 
          :key="idx" 
          class="gallery-item"
          @click="previewImages(idx)"
        >
          <el-image :src="img" fit="cover" :preview-src-list="diary.images" :initial-index="idx" />
        </div>
      </div>
      
      <!-- 标签 -->
      <div class="diary-tags" v-if="diary.tags && diary.tags.length">
        <el-tag v-for="tag in diary.tags" :key="tag" effect="plain">
          {{ tag }}
        </el-tag>
      </div>
      
      <!-- 元信息 -->
      <div class="diary-meta">
        <span>创建于 {{ formatTime(diary.created_at) }}</span>
        <span v-if="diary.updated_at !== diary.created_at">
          · 更新于 {{ formatTime(diary.updated_at) }}
        </span>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('edit', diary)">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button type="danger" @click="handleDelete">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { getMoodInfo, formatDiaryDate } from '@/constants/diary.js'

const props = defineProps({
  modelValue: Boolean,
  diary: Object
})

const emit = defineEmits(['update:modelValue', 'edit', 'delete'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 情绪信息
const moodInfo = computed(() => getMoodInfo(props.diary?.mood))

// 格式化日期
const formattedDate = computed(() => {
  return props.diary ? formatDiaryDate(props.diary.diary_date) : ''
})

// 段落分割
const paragraphs = computed(() => {
  if (!props.diary?.content) return []
  return props.diary.content.split('\n').filter(p => p.trim())
})

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 删除确认
const handleDelete = () => {
  ElMessageBox.confirm('确定要删除这篇日记吗？删除后无法恢复。', '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('delete', props.diary)
  }).catch(() => {})
}

// 预览图片
const previewImages = (idx) => {
  // el-image 组件自带预览功能
}
</script>

<style scoped>
.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.mood-emoji-large {
  font-size: 48px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mood-label {
  font-size: 20px;
  font-weight: 600;
  color: var(--mood-color);
}

.date-text {
  font-size: 14px;
  color: #909399;
}

.detail-content {
  padding: 0 8px;
}

.diary-title {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  line-height: 1.4;
}

.diary-body {
  font-size: 15px;
  line-height: 1.8;
  color: #606266;
  margin-bottom: 20px;
}

.diary-body p {
  margin-bottom: 12px;
}

.diary-body p:last-child {
  margin-bottom: 0;
}

/* 图片画廊 */
.diary-gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.gallery-item {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.gallery-item :deep(.el-image) {
  width: 100%;
  height: 100%;
}

/* 标签 */
.diary-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

/* 元信息 */
.diary-meta {
  font-size: 12px;
  color: #909399;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  :deep(.diary-detail-dialog) {
    width: 95% !important;
    margin: 10px auto !important;
  }
  
  .diary-gallery {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .mood-emoji-large {
    font-size: 36px;
  }
}
</style>

