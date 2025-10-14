<template>
  <Navbar />
  <div class="quiz-index">
    <el-card class="select-card" shadow="hover">
      <div class="form-row">
        <div class="label">选择分类</div>
        <el-select v-model.number="selectedCategoryId" placeholder="请选择分类" style="width: 280px">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
        <el-button type="primary" style="margin-left: 8px" @click="startQuiz" :disabled="!selectedCategoryId">开始做题</el-button>
        <el-button style="margin-left: 4px" @click="resetQuiz" :disabled="!started">重选分类</el-button>
      </div>
    </el-card>

    <el-card v-if="started" class="quiz-card" shadow="hover">
      <div v-if="loading">加载中...</div>
      <div v-else-if="questions.length === 0">该分类暂无题目</div>
      <div v-else class="question">
        <div class="meta">
          <span>第 {{ index + 1 }} / {{ questions.length }} 题</span>
        </div>
        <div class="stem">{{ currentQuestion.content }}</div>
        <el-radio-group v-model="selected" :disabled="answered" class="options">
          <el-radio label="A">A. {{ currentQuestion.optionA }}</el-radio>
          <el-radio label="B">B. {{ currentQuestion.optionB }}</el-radio>
          <el-radio label="C">C. {{ currentQuestion.optionC }}</el-radio>
          <el-radio label="D">D. {{ currentQuestion.optionD }}</el-radio>
        </el-radio-group>
        <div class="result" v-if="answered">
          <el-alert v-if="isCorrect" title="答对了" type="success" show-icon />
          <el-alert v-else :title="'答错了，正确答案：' + currentQuestion.correctAnswer" type="error" show-icon />
        </div>
        <div class="actions">
          <el-button type="primary" :disabled="!selected" v-if="!answered" @click="submit">提交</el-button>
          <el-button v-else @click="next">{{ isLast ? '完成' : '下一题' }}</el-button>
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
          <el-button type="primary" @click="resetQuiz">重新开始</el-button>
          <el-button @click="$router.push('/index-quiz-wrong')">查看错题</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Navbar from '../../components/Navbar.vue'
import { getQuizCategories, getQuizQuestionsByCategory, submitQuizAnswer } from '@/api'

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

const currentQuestion = computed(() => questions.value[index.value] || {})
const isLast = computed(() => index.value >= questions.value.length - 1)

const loadCategories = async () => {
  const res = await getQuizCategories()
  categories.value = Array.isArray(res) ? res : (res?.data || [])
}

const startQuiz = async () => {
  if (!selectedCategoryId.value) return
  started.value = true
  loading.value = true
  try {
    const res = await getQuizQuestionsByCategory(selectedCategoryId.value)
    questions.value = Array.isArray(res) ? res : (res?.data || [])
    index.value = 0
    selected.value = ''
    answered.value = false
    isCorrect.value = false
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
}

onMounted(loadCategories)
</script>

<style scoped>
.quiz-index { padding: 20px; margin: 20px; display: flex; flex-direction: column; gap: 16px; }
.form-row { display: flex; align-items: center; gap: 8px; }
.label { font-size: 13px; color: #666; }
.quiz-card { padding: 8px; }
.question { display: flex; flex-direction: column; gap: 10px; }
.meta { color: #666; font-size: 13px; }
.stem { font-weight: 600; font-size: 16px; margin-top: 4px; }
.options { display: grid; gap: 8px; margin-top: 6px; }
.actions { margin-top: 8px; }
.result-card { margin-top: 16px; }
.result-content { text-align: center; padding: 20px; }
.result-content h3 { margin-bottom: 20px; color: #409eff; }
.score-info { display: flex; justify-content: center; gap: 40px; margin-bottom: 20px; }
.score-item { display: flex; flex-direction: column; gap: 4px; }
.score-item .label { font-size: 14px; color: #666; }
.score-item .value { font-size: 18px; font-weight: 600; }
.score-item .value.score { color: #67c23a; }
.result-actions { display: flex; justify-content: center; gap: 12px; }
</style>


