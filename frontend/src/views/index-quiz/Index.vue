<template>
  <div class="quiz-index">
    <el-card class="select-card" shadow="hover">
      <div class="form-row">
        <div class="label">选择分类</div>
        <el-select v-model.number="selectedCategoryId" placeholder="请选择分类" style="width: 240px">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
        <el-button type="primary" size="small" style="margin-left: 6px" @click="startQuiz" :disabled="!selectedCategoryId">开始做题</el-button>
        <el-button size="small" style="margin-left: 3px" @click="resetQuiz" :disabled="!started">重选分类</el-button>
      </div>
      
      <!-- 学习统计 -->
      <div class="stats-row" v-if="todayStats">
        <div class="stat-item">
          <span class="stat-label">今日做题</span>
          <span class="stat-value">{{ todayStats.todayQuestions }} 题</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">今日得分</span>
          <span class="stat-value">{{ todayStats.todayScore }} 分</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">今日正确率</span>
          <span class="stat-value">{{ todayStats.todayAccuracy }}%</span>
        </div>
      </div>
    </el-card>

    <el-card v-if="started" class="quiz-card" shadow="hover">
      <div v-if="loading">加载中...</div>
      <div v-else-if="questions.length === 0">该分类暂无题目</div>
      <div v-else class="question">
        <div class="meta">
          <div class="meta-left">
            <span>第 {{ index + 1 }} / {{ questions.length }} 题</span>
            <el-tag :type="getDifficultyType(currentQuestion.difficulty)" size="small">
              {{ getDifficultyText(currentQuestion.difficulty) }}
            </el-tag>
          </div>
          <el-button 
            :icon="isFavorited ? 'StarFilled' : 'Star'" 
            :type="isFavorited ? 'warning' : 'default'"
            size="small"
            @click="toggleFavorite"
            circle
          />
        </div>
        <div class="stem">{{ currentQuestion.content }}</div>
        <div class="options-container">
          <el-radio-group v-model="selected" :disabled="answered" class="options">
            <el-radio label="A" class="option-item">
              <span class="option-label">A.</span>
              <span class="option-text">{{ currentQuestion.optionA }}</span>
            </el-radio>
            <el-radio label="B" class="option-item">
              <span class="option-label">B.</span>
              <span class="option-text">{{ currentQuestion.optionB }}</span>
            </el-radio>
            <el-radio label="C" class="option-item">
              <span class="option-label">C.</span>
              <span class="option-text">{{ currentQuestion.optionC }}</span>
            </el-radio>
            <el-radio label="D" class="option-item">
              <span class="option-label">D.</span>
              <span class="option-text">{{ currentQuestion.optionD }}</span>
            </el-radio>
          </el-radio-group>
        </div>
        <div class="result" v-if="answered">
          <el-alert v-if="isCorrect" title="答对了" type="success" show-icon />
          <el-alert v-else :title="'答错了，正确答案：' + currentQuestion.correctAnswer" type="error" show-icon />
        </div>
        <div class="actions">
          <el-button type="primary" size="small" :disabled="!selected" v-if="!answered" @click="submit">
            提交答案 (Enter)
          </el-button>
          <el-button size="small" v-else @click="next">
            {{ isLast ? '完成答题 (Enter)' : '下一题 (Enter)' }}
          </el-button>
        </div>
        
        <!-- 快捷键提示 -->
        <div class="shortcuts" v-if="!answered">
          <span class="shortcut-hint">💡 提示：可使用键盘 A、B、C、D 快速选择答案</span>
        </div>
      </div>
    </el-card>

    <!-- 完成结果 -->
    <el-card v-if="completed" class="result-card" shadow="hover">
      <div class="result-content">
        <h3>答题完成！</h3>
        <div class="score-info">
          <div class="score-item">
            <span class="label">总题数：</span>
            <span class="value">{{ questions.length }}</span>
          </div>
          <div class="score-item">
            <span class="label">总得分：</span>
            <span class="value score">{{ totalScore }}</span>
          </div>
          <div class="score-item">
            <span class="label">正确率：</span>
            <span class="value">{{ ((totalScore / 10) / questions.length * 100).toFixed(1) }}%</span>
          </div>
        </div>
        <div class="result-actions">
          <el-button type="primary" size="small" @click="resetQuiz">重新开始</el-button>
          <el-button size="small" @click="$router.push('/study/wrong')">查看错题</el-button>
          <el-button size="small" @click="$router.push('/study/favorites')">我的收藏</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { getQuizCategories, getQuizQuestions, submitQuizAnswer, addQuizFavorite, removeQuizFavorite, checkQuizFavorite, getUserQuizStats } from '@/api'

const categories = ref([])
const selectedCategoryId = ref(null)
const started = ref(false)
const loading = ref(false)
const questions = ref([])
const index = ref(0)
const selected = ref('')
const answered = ref(false)
const isCorrect = ref(false)
const totalScore = ref(0)
const completed = ref(false)
const userId = ref(1) // 简化版，实际应从登录状态获取
const isFavorited = ref(false)
const todayStats = ref(null)

const currentQuestion = computed(() => questions.value[index.value] || {})
const isLast = computed(() => index.value >= questions.value.length - 1)

const loadCategories = async () => {
  const res = await getQuizCategories()
  categories.value = Array.isArray(res) ? res : (res?.data || [])
  await loadTodayStats()
}

const loadTodayStats = async () => {
  try {
    const res = await getUserQuizStats(userId.value)
    if (res) {
      todayStats.value = {
        todayQuestions: res.totalQuestions || 0,
        todayScore: res.totalScore || 0,
        todayAccuracy: res.accuracy || '0.0%'
      }
    }
  } catch (error) {
    console.error('加载今日统计失败:', error)
  }
}

const startQuiz = async () => {
  if (!selectedCategoryId.value) return
  started.value = true
  loading.value = true
  try {
    // 统一新API：通过 categoryId 获取该分类题目（不分页，取足够大页大小）
    const res = await getQuizQuestions({ categoryId: selectedCategoryId.value, page: 1, pageSize: 9999 })
    const data = res?.data || res
    questions.value = data || []
    index.value = 0
    selected.value = ''
    answered.value = false
    isCorrect.value = false
    await checkCurrentFavorite()
  } finally {
    loading.value = false
  }
}

const resetQuiz = () => {
  started.value = false
  questions.value = []
  index.value = 0
  selected.value = ''
  answered.value = false
  isCorrect.value = false
  totalScore.value = 0
  completed.value = false
  isFavorited.value = false
}

const submit = async () => {
  answered.value = true
  isCorrect.value = selected.value === currentQuestion.value.correctAnswer
  
  // 提交答题记录
  try {
    await submitQuizAnswer({
      userId: userId.value,
      questionId: currentQuestion.value.id,
      userAnswer: selected.value,
      score: 10
    })
    
    if (isCorrect.value) {
      totalScore.value += 10
    }
    
    // 更新今日统计
    await loadTodayStats()
  } catch (error) {
    console.error('提交答题记录失败:', error)
  }
}

const next = () => {
  if (isLast.value) {
    completed.value = true
    return
  }
  index.value += 1
  selected.value = ''
  answered.value = false
  isCorrect.value = false
  checkCurrentFavorite()
}

const checkCurrentFavorite = async () => {
  if (!currentQuestion.value.id) return
  try {
    const res = await checkQuizFavorite(userId.value, currentQuestion.value.id)
    isFavorited.value = res?.data || false
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

const toggleFavorite = async () => {
  if (!currentQuestion.value.id) return
  
  try {
    if (isFavorited.value) {
      await removeQuizFavorite(userId.value, currentQuestion.value.id)
      isFavorited.value = false
    } else {
      await addQuizFavorite({
        userId: userId.value,
        questionId: currentQuestion.value.id
      })
      isFavorited.value = true
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
  }
}

// 键盘快捷键
const handleKeyPress = (event) => {
  if (!started.value || answered.value) return
  
  const key = event.key.toUpperCase()
  if (['A', 'B', 'C', 'D'].includes(key)) {
    selected.value = key
  } else if (event.key === 'Enter' && selected.value) {
    if (!answered.value) {
      submit()
    } else {
      next()
    }
  }
}

onMounted(() => {
  loadCategories()
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})

const getDifficultyType = (difficulty) => {
  const types = { 1: 'success', 2: 'warning', 3: 'danger' }
  return types[difficulty] || 'info'
}

const getDifficultyText = (difficulty) => {
  const texts = { 1: '简单', 2: '中等', 3: '困难' }
  return texts[difficulty] || '未知'
}
</script>

<style scoped>
.quiz-index { padding: 12px; margin: 12px; display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; align-items: center; gap: 6px; }
.label { font-size: 12px; color: #666; }
.quiz-card { padding: 6px; }
.question { display: flex; flex-direction: column; gap: 8px; }
.meta { color: #666; font-size: 12px; display: flex; justify-content: space-between; align-items: center; }
.meta-left { display: flex; align-items: center; gap: 6px; }
.stem { font-weight: 600; font-size: 14px; margin-top: 2px; line-height: 1.4; padding: 12px; background: #f8f9fa; border-radius: 6px; border-left: 3px solid #409eff; }
.options-container { margin-top: 12px; }
.options { display: grid; gap: 8px; }
.option-item { 
  padding: 8px 12px; 
  border: 2px solid #e4e7ed; 
  border-radius: 6px; 
  transition: all 0.3s ease;
  cursor: pointer;
}
.option-item:hover { border-color: #409eff; background: #f0f9ff; }
.option-item.is-checked { border-color: #409eff; background: #e6f7ff; }
.option-label { font-weight: 600; color: #409eff; margin-right: 6px; }
.option-text { line-height: 1.3; font-size: 13px; }
.actions { margin-top: 12px; display: flex; justify-content: center; }
.shortcuts { margin-top: 8px; text-align: center; }
.shortcut-hint { font-size: 11px; color: #909399; background: #f4f4f5; padding: 4px 8px; border-radius: 3px; }
.result-card { margin-top: 12px; }
.result-content { text-align: center; padding: 16px; }
.result-content h3 { margin-bottom: 16px; color: #409eff; font-size: 18px; }
.score-info { display: flex; justify-content: center; gap: 30px; margin-bottom: 16px; }
.score-item { display: flex; flex-direction: column; gap: 3px; }
.score-item .label { font-size: 12px; color: #666; }
.score-item .value { font-size: 16px; font-weight: 600; }
.score-item .value.score { color: #67c23a; }
.stats-row { margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0; display: flex; justify-content: space-around; }
.stat-item { text-align: center; }
.stat-label { display: block; font-size: 11px; color: #666; margin-bottom: 3px; }
.stat-value { display: block; font-size: 14px; font-weight: 600; color: #409eff; }

/* 响应式优化 */
@media (max-width: 768px) {
  .quiz-index { padding: 8px; margin: 8px; gap: 8px; }
  .form-row { flex-direction: column; align-items: stretch; gap: 8px; }
  .form-row .el-select { width: 100% !important; }
  .stats-row { flex-direction: column; gap: 8px; }
  .score-info { flex-direction: column; gap: 12px; }
  .result-actions { flex-direction: column; gap: 8px; }
  .result-actions .el-button { width: 100%; }
}

@media (max-height: 700px) {
  .quiz-index { padding: 6px; margin: 6px; gap: 6px; }
  .stem { padding: 8px; font-size: 13px; }
  .option-item { padding: 6px 10px; }
  .result-content { padding: 12px; }
  .result-content h3 { margin-bottom: 12px; font-size: 16px; }
  .shortcuts { margin-top: 6px; }
  .shortcut-hint { font-size: 10px; padding: 3px 6px; }
}

@media (max-height: 600px) {
  .quiz-index { padding: 4px; margin: 4px; gap: 4px; }
  .stem { padding: 6px; font-size: 12px; }
  .option-item { padding: 4px 8px; }
  .result-content { padding: 8px; }
  .result-content h3 { margin-bottom: 8px; font-size: 14px; }
  .score-info { gap: 20px; margin-bottom: 12px; }
  .stats-row { margin-top: 8px; padding-top: 8px; }
}
</style>


