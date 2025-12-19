<template>
  <div class="exercise-record-detail">
    <el-card class="study-card" v-loading="loading">
      <!-- 返回按钮 -->
      <div style="margin-bottom: 16px;">
        <el-button @click="$router.back()">← 返回</el-button>
      </div>

      <!-- 概览信息 -->
      <div v-if="record" class="record-summary">
        <h2>做题记录详情</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">开始时间</div>
            <div class="summary-value">{{ formatDate(record.startTime) }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">结束时间</div>
            <div class="summary-value">{{ formatDate(record.endTime) }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">总用时</div>
            <div class="summary-value">{{ formatDuration(record.durationSeconds) }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">总题数</div>
            <div class="summary-value">{{ record.totalCount }} 题</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">正确数</div>
            <div class="summary-value" style="color: #67C23A;">{{ record.correctCount }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">错误数</div>
            <div class="summary-value" style="color: #F56C6C;">{{ record.wrongCount }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">正确率</div>
            <div class="summary-value">{{ ((record.accuracy || 0) * 100).toFixed(1) }}%</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">得分</div>
            <div class="summary-value">{{ record.score || 0 }} / {{ record.maxScore || 0 }}</div>
          </div>
        </div>
      </div>

      <!-- 题目列表 -->
      <div v-if="items && items.length > 0" class="question-list">
        <h3 style="margin-bottom: 16px;">题目列表</h3>
        <div v-for="(item, index) in items" :key="item.id" class="question-item">
          <div class="question-header">
            <span class="question-index">第 {{ index + 1 }} 题</span>
            <el-tag :type="item.isCorrect ? 'success' : 'danger'" size="small">
              {{ item.isCorrect ? '正确' : '错误' }}
            </el-tag>
          </div>
          <div class="question-content" v-if="item.question">
            <div class="question-stem">{{ item.question.content || '题目内容加载中...' }}</div>
            <div class="question-options" v-if="item.question.optionA">
              <div>A. {{ item.question.optionA }}</div>
              <div>B. {{ item.question.optionB }}</div>
              <div>C. {{ item.question.optionC }}</div>
              <div>D. {{ item.question.optionD }}</div>
            </div>
            <div class="question-answer">
              <span>我的答案：<strong :class="item.isCorrect ? 'answer-correct' : 'answer-wrong'">{{ item.userAnswer || '未作答' }}</strong></span>
              <span style="margin-left: 16px;">
                正确答案：<strong class="answer-correct">{{ item.question.correctAnswer || '--' }}</strong>
              </span>
            </div>
            <div class="question-score" v-if="item.score !== undefined">
              得分：<span :class="item.isCorrect ? 'score-correct' : 'score-wrong'">{{ item.score }}</span> / {{ item.maxScore || 10 }}
            </div>
          </div>
          <div v-else class="question-loading">
            题目信息加载中...
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && (!items || items.length === 0)" class="study-empty">
        <div class="empty-icon">📝</div>
        <div class="empty-text">暂无题目详情</div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getExerciseRecordDetail } from '@/api'
import { ElMessage } from 'element-plus'
import '@/styles/study/index.scss'

const route = useRoute()
const userStore = useUserStore()
const userId = computed(() => userStore.userId || 1)

const loading = ref(false)
const record = ref(null)
const items = ref([])

// 加载详情
const loadDetail = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('记录ID不存在')
    return
  }

  loading.value = true
  try {
    const res = await getExerciseRecordDetail(id, { userId: userId.value })
    const data = res?.data || res
    record.value = data?.record || null
    items.value = data?.items || []
  } catch (error) {
    console.error('加载记录详情失败:', error)
    ElMessage.error('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 工具函数
const formatDate = (date) => {
  if (!date) return '--'
  return new Date(date).toLocaleString('zh-CN')
}

const formatDuration = (seconds) => {
  if (!seconds) return '0秒'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins > 0) {
    return `${mins}分${secs}秒`
  }
  return `${secs}秒`
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.exercise-record-detail {
  padding: 20px;
}

.record-summary {
  margin-bottom: 24px;
}

.record-summary h2 {
  margin-bottom: 16px;
  font-size: 18px;
  color: #303133;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-item {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.summary-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.question-list {
  margin-top: 24px;
}

.question-item {
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.question-index {
  font-weight: 600;
  color: #303133;
}

.question-content {
  margin-top: 12px;
}

.question-stem {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
  line-height: 1.6;
}

.question-options {
  margin: 12px 0;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.question-options div {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.question-answer {
  margin-top: 12px;
  padding: 8px;
  background: #f0f9ff;
  border-radius: 6px;
  font-size: 14px;
}

.question-score {
  margin-top: 8px;
  font-size: 13px;
  color: #909399;
}

.answer-correct {
  color: #67C23A;
}

.answer-wrong {
  color: #F56C6C;
}

.score-correct {
  color: #67C23A;
  font-weight: 600;
}

.score-wrong {
  color: #F56C6C;
  font-weight: 600;
}

.question-loading {
  padding: 20px;
  text-align: center;
  color: #909399;
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>

