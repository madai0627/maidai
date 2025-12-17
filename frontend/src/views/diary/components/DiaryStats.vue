<template>
  <div class="diary-stats">
    <!-- 连续记录 -->
    <el-card class="streak-card" shadow="hover">
      <div class="streak-content">
        <div class="streak-icon">🔥</div>
        <div class="streak-info">
          <div class="streak-number">{{ streakDays }}</div>
          <div class="streak-label">连续记录天数</div>
        </div>
      </div>
    </el-card>

    <!-- 情绪统计 -->
    <el-card class="stats-card" shadow="hover">
      <div class="stats-header">
        <span class="stats-title">📊 情绪统计</span>
        <el-date-picker
          v-model="currentMonth"
          type="month"
          placeholder="选择月份"
          value-format="YYYY-MM"
          size="small"
          @change="handleMonthChange"
          style="width: 120px"
        />
      </div>
      
      <!-- 饼图 -->
      <MoodChart 
        :data="moodStats" 
        :loading="loading"
        @select="handleMoodSelect"
      />
      
      <!-- 图例 -->
      <div class="mood-legend">
        <div
          v-for="item in moodStats"
          :key="item.mood"
          class="legend-item"
          :class="{ active: selectedMood === item.mood }"
          @click="handleMoodSelect(item.mood)"
        >
          <span class="mood-emoji">{{ item.emoji }}</span>
          <span class="mood-label">{{ item.name }}</span>
          <span class="mood-count">{{ item.value }}</span>
          <span class="mood-percent">({{ item.percent }}%)</span>
        </div>
      </div>
    </el-card>

    <!-- 日历预览 -->
    <el-card class="calendar-card" shadow="hover">
      <div class="calendar-header">📅 本月记录</div>
      <div class="calendar-grid">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          class="calendar-day"
          :class="{ 'has-diary': day.hasDiary, today: day.isToday }"
          :title="day.hasDiary ? `${day.date}: ${day.emoji}` : day.date"
        >
          <span class="day-number">{{ day.dayNum }}</span>
          <span class="day-emoji" v-if="day.hasDiary">{{ day.emoji }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import MoodChart from '@/components/diary/MoodChart.vue'
import { getDiaryMoodStats, getDiaryCalendar, getDiaryStreak } from '@/api/index.js'

const props = defineProps({
  userId: {
    type: Number,
    required: true
  },
  selectedMood: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['mood-select', 'month-change'])

// 状态
const currentMonth = ref('')
const moodStats = ref([])
const calendarData = ref([])
const streakDays = ref(0)
const loading = ref(false)

// 初始化月份
onMounted(() => {
  const now = new Date()
  currentMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  loadAllStats()
})

// 加载所有统计数据
const loadAllStats = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadMoodStats(),
      loadCalendar(),
      loadStreak()
    ])
  } finally {
    loading.value = false
  }
}

// 加载情绪统计
const loadMoodStats = async () => {
  try {
    const res = await getDiaryMoodStats({
      userId: props.userId,
      month: currentMonth.value
    })
    if (res.code === 0) {
      moodStats.value = res.data
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 加载日历数据
const loadCalendar = async () => {
  try {
    const res = await getDiaryCalendar({
      userId: props.userId,
      month: currentMonth.value
    })
    if (res.code === 0) {
      calendarData.value = res.data
    }
  } catch (error) {
    console.error('加载日历失败:', error)
  }
}

// 加载连续天数
const loadStreak = async () => {
  try {
    const res = await getDiaryStreak(props.userId)
    if (res.code === 0) {
      streakDays.value = res.data.streak
    }
  } catch (error) {
    console.error('加载连续天数失败:', error)
  }
}

// 日历天数计算
const calendarDays = computed(() => {
  const [year, month] = (currentMonth.value || '2024-01').split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  
  const days = []
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const diaryDay = calendarData.value.find(d => d.date === dateStr)
    days.push({
      date: dateStr,
      dayNum: i,
      hasDiary: !!diaryDay,
      emoji: diaryDay?.emoji || '',
      isToday: dateStr === todayStr
    })
  }
  return days
})

// 月份变化
const handleMonthChange = () => {
  loadMoodStats()
  loadCalendar()
  emit('month-change', currentMonth.value)
}

// 情绪选择
const handleMoodSelect = (mood) => {
  emit('mood-select', mood === props.selectedMood ? '' : mood)
}

// 刷新数据（供父组件调用）
const refresh = () => {
  loadAllStats()
}

defineExpose({ refresh })
</script>

<style scoped>
.diary-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 连续记录卡片 */
.streak-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.streak-card :deep(.el-card__body) {
  padding: 20px;
}

.streak-content {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #fff;
}

.streak-icon {
  font-size: 40px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.streak-number {
  font-size: 36px;
  font-weight: 700;
}

.streak-label {
  font-size: 14px;
  opacity: 0.9;
}

/* 统计卡片 */
.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stats-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 情绪图例 */
.mood-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.legend-item:hover {
  background: #f5f7fa;
}

.legend-item.active {
  background: #ecf5ff;
  border: 1px solid #409eff;
}

.mood-emoji {
  font-size: 20px;
}

.mood-label {
  font-size: 14px;
  color: #606266;
  flex: 1;
}

.mood-count {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.mood-percent {
  font-size: 12px;
  color: #909399;
}

/* 日历卡片 */
.calendar-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #f5f7fa;
  font-size: 12px;
  position: relative;
  transition: all 0.2s;
}

.calendar-day.has-diary {
  background: #e1f3d8;
}

.calendar-day.today {
  border: 2px solid #409eff;
}

.day-number {
  color: #606266;
}

.day-emoji {
  position: absolute;
  bottom: 2px;
  font-size: 10px;
}

/* 响应式 */
@media (max-width: 768px) {
  .streak-content {
    justify-content: center;
  }
  
  .stats-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>

