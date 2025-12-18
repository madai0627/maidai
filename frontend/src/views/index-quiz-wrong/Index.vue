<template>
  <div class="wrong-questions">
    <el-card class="header-card" shadow="hover">
      <div class="header-content">
        <h2>错题本</h2>
        <div class="stats">
          <span>共 {{ wrongQuestions.length }} 道错题</span>
          <el-button type="primary" @click="startReview" :disabled="wrongQuestions.length === 0">开始复习</el-button>
        </div>
      </div>
    </el-card>

    <el-card v-if="reviewing" class="review-card" shadow="hover">
      <div v-if="loading">加载中...</div>
      <div v-else-if="reviewQuestions.length === 0">暂无错题</div>
      <div v-else class="question">
        <div class="meta">
          <span>复习第 {{ reviewIndex + 1 }} / {{ reviewQuestions.length }} 题</span>
          <span class="category">{{ currentReviewQuestion.question.category.name }}</span>
        </div>
        <div class="stem">{{ currentReviewQuestion.question.content }}</div>
        <el-radio-group v-model="selected" :disabled="answered" class="options">
          <el-radio label="A">A. {{ currentReviewQuestion.question.optionA }}</el-radio>
          <el-radio label="B">B. {{ currentReviewQuestion.question.optionB }}</el-radio>
          <el-radio label="C">C. {{ currentReviewQuestion.question.optionC }}</el-radio>
          <el-radio label="D">D. {{ currentReviewQuestion.question.optionD }}</el-radio>
        </el-radio-group>
        <div class="result" v-if="answered">
          <el-alert v-if="isCorrect" title="答对了" type="success" show-icon />
          <el-alert v-else :title="'答错了，正确答案：' + currentReviewQuestion.question.correctAnswer" type="error" show-icon />
          <div class="previous-answer">
            <span>上次答案：{{ currentReviewQuestion.userAnswer }}</span>
          </div>
        </div>
        <div class="actions">
          <el-button type="primary" :disabled="!selected" v-if="!answered" @click="submit">提交</el-button>
          <el-button v-else @click="next">{{ isLast ? '完成复习' : '下一题' }}</el-button>
        </div>
      </div>
    </el-card>

    <el-card v-else class="list-card" shadow="hover">
      <el-table :data="wrongQuestions" border style="width: 100%">
        <el-table-column prop="question.category.name" label="分类" width="160" align="center" />
        <el-table-column prop="question.content" label="题目" min-width="300" />
        <el-table-column prop="userAnswer" label="我的答案" width="100" align="center" />
        <el-table-column prop="question.correctAnswer" label="正确答案" width="100" align="center" />
        <el-table-column prop="createdAt" label="答题时间" width="180" align="center">
          <template #default="scope">
            {{ new Date(scope.row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="reviewSingle(scope.$index)">复习</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getWrongQuestions, submitQuizAnswer } from '@/api'

const router = useRouter()
const userStore = useUserStore()

const wrongQuestions = ref([])
const reviewing = ref(false)
const reviewQuestions = ref([])
const reviewIndex = ref(0)
const selected = ref('')
const answered = ref(false)
const isCorrect = ref(false)
const loading = ref(false)
const userId = computed(() => userStore.userId || 1) // 从 userStore 获取，如果没有则默认为 1

const currentReviewQuestion = computed(() => reviewQuestions.value[reviewIndex.value] || {})
const isLast = computed(() => reviewIndex.value >= reviewQuestions.value.length - 1)

const loadWrongQuestions = async () => {
  loading.value = true
  try {
    const res = await getWrongQuestions(userId.value)
    wrongQuestions.value = Array.isArray(res) ? res : (res?.data || [])
  } finally {
    loading.value = false
  }
}

const startReview = () => {
  reviewing.value = true
  reviewQuestions.value = [...wrongQuestions.value]
  reviewIndex.value = 0
  selected.value = ''
  answered.value = false
  isCorrect.value = false
}

const reviewSingle = (index) => {
  reviewing.value = true
  reviewQuestions.value = [wrongQuestions.value[index]]
  reviewIndex.value = 0
  selected.value = ''
  answered.value = false
  isCorrect.value = false
}

const submit = async () => {
  answered.value = true
  isCorrect.value = selected.value === currentReviewQuestion.value.question.correctAnswer
  
  // 提交答题记录
  try {
    await submitQuizAnswer({
      userId: userId.value,
      questionId: currentReviewQuestion.value.question.id,
      userAnswer: selected.value,
      score: 10
    })
  } catch (error) {
    console.error('提交答题记录失败:', error)
  }
}

const next = () => {
  if (isLast.value) {
    reviewing.value = false
    loadWrongQuestions() // 重新加载错题列表
    return
  }
  reviewIndex.value += 1
  selected.value = ''
  answered.value = false
  isCorrect.value = false
}

onMounted(loadWrongQuestions)
</script>

<style scoped>
.wrong-questions { padding: 20px; margin: 20px; display: flex; flex-direction: column; gap: 16px; }
.header-content { display: flex; justify-content: space-between; align-items: center; }
.header-content h2 { margin: 0; color: #409eff; }
.stats { display: flex; align-items: center; gap: 16px; }
.review-card { padding: 8px; }
.question { display: flex; flex-direction: column; gap: 10px; }
.meta { color: #666; font-size: 13px; display: flex; justify-content: space-between; }
.category { background: #f0f9ff; padding: 2px 8px; border-radius: 4px; }
.stem { font-weight: 600; font-size: 16px; margin-top: 4px; }
.options { display: grid; gap: 8px; margin-top: 6px; }
.actions { margin-top: 8px; }
.previous-answer { margin-top: 8px; font-size: 14px; color: #666; }
</style>
