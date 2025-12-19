<template>
  <div class="study-home" v-loading="loading">
    <el-card class="study-card">
      <div class="card-header">
        <h2 class="card-title">学习中心</h2>
        <p class="card-subtitle">查看你的错题、做题记录和学习数据</p>
      </div>
    </el-card>

    <!-- 功能入口卡片 -->
    <div class="entry-cards">
      <el-card class="study-entry-card primary-card" @click="$router.push('/study/quiz')">
        <div class="entry-icon">✏️</div>
        <div class="entry-title">开始做题</div>
        <div class="entry-desc">选择分类开始练习</div>
        <div class="entry-stats">立即开始</div>
      </el-card>

      <el-card class="study-entry-card" @click="$router.push('/study/wrong-questions')">
        <div class="entry-icon">📚</div>
        <div class="entry-title">错题复习</div>
        <div class="entry-desc">集中管理并复习错题</div>
        <div class="entry-stats" v-if="wrongQuestionStats">
          {{ wrongQuestionStats.total }} 道错题
        </div>
        <div class="entry-stats" v-else>--</div>
      </el-card>

      <el-card class="study-entry-card" @click="$router.push('/study/records')">
        <div class="entry-icon">📝</div>
        <div class="entry-title">做题记录</div>
        <div class="entry-desc">查看历史做题记录</div>
        <div class="entry-stats" v-if="recordStats">
          {{ recordStats.recentCount }} 次记录
        </div>
        <div class="entry-stats" v-else>--</div>
      </el-card>

      <el-card class="study-entry-card" @click="$router.push('/study/stats')">
        <div class="entry-icon">📊</div>
        <div class="entry-title">学习数据</div>
        <div class="entry-desc">查看学习统计图表</div>
        <div class="entry-stats" v-if="overviewStats">
          {{ overviewStats.avgAccuracy }}% 正确率
        </div>
        <div class="entry-stats" v-else>--</div>
      </el-card>
    </div>

    <!-- 概览统计 -->
    <el-card class="study-card" v-if="overviewStats">
      <div class="card-header">
        <div class="card-title">学习概览</div>
      </div>
      <div class="overview-stats">
        <div class="stat-item">
          <div class="stat-label">最近7天做题</div>
          <div class="stat-value">{{ overviewStats.totalExercises || 0 }} 次</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">总题数</div>
          <div class="stat-value">{{ overviewStats.totalQuestions || 0 }} 题</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">平均正确率</div>
          <div class="stat-value">{{ overviewStats.avgAccuracy || '0.0' }}%</div>
        </div>
      </div>
    </el-card>

    <!-- 小图表区域 -->
    <el-card class="study-card" v-if="overviewStats && overviewStats.accuracyTrend && overviewStats.accuracyTrend.length > 0">
      <div class="card-header">
        <div class="card-title">最近7天正确率趋势</div>
      </div>
      <div class="chart-wrapper">
        <StudyChart :option="trendChartOption" height="250px" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getWrongQuestions, getExerciseRecords, getLearningOverview } from '@/api'
import { ElMessage } from 'element-plus'
import StudyChart from '@/components/study/StudyChart.vue'
import '@/styles/study/index.scss'

const userStore = useUserStore()
const userId = computed(() => userStore.userId || 1)

const loading = ref(false)
const wrongQuestionStats = ref(null)
const recordStats = ref(null)
const overviewStats = ref(null)

// 加载错题统计
const loadWrongQuestionStats = async () => {
  try {
    const res = await getWrongQuestions(userId.value)
    const data = Array.isArray(res) ? res : (res?.data || [])
    wrongQuestionStats.value = {
      total: data.length || 0,
      unReviewed: data.filter(item => item.status === 0 || item.status === undefined).length
    }
  } catch (error) {
    console.error('加载错题统计失败:', error)
    // 静默失败，不影响其他数据加载
  }
}

// 加载记录统计
const loadRecordStats = async () => {
  try {
    const res = await getExerciseRecords({ userId: userId.value, page: 1, pageSize: 1 })
    const data = res?.data || res
    recordStats.value = {
      recentCount: data?.total || 0
    }
  } catch (error) {
    console.error('加载记录统计失败:', error)
    // 静默失败
  }
}

// 加载概览数据
const loadOverview = async () => {
  try {
    const res = await getLearningOverview({ userId: userId.value, range: '7d' })
    const data = res?.data || res
    // 处理数据格式，确保字段存在
    overviewStats.value = {
      totalExercises: data?.summary?.totalExercises || data?.totalExercises || 0,
      totalQuestions: data?.summary?.totalQuestions || data?.totalQuestions || 0,
      avgAccuracy: data?.summary?.avgAccuracy || data?.avgAccuracy || '0.0',
      accuracyTrend: data?.accuracyTrend || []
    }
  } catch (error) {
    console.error('加载概览数据失败:', error)
    // 静默失败，显示默认值
    overviewStats.value = {
      totalExercises: 0,
      totalQuestions: 0,
      avgAccuracy: '0.0',
      accuracyTrend: []
    }
  }
}

// 统一加载所有数据
const loadAllData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadWrongQuestionStats(),
      loadRecordStats(),
      loadOverview()
    ])
  } catch (error) {
    ElMessage.error('数据加载失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

// 趋势图配置
const trendChartOption = computed(() => {
  if (!overviewStats.value?.accuracyTrend || overviewStats.value.accuracyTrend.length === 0) {
    return null
  }
  
  const trendData = overviewStats.value.accuracyTrend
  const dates = trendData.map(item => item.date || item.day || '')
  const values = trendData.map(item => {
    const val = item.accuracy || item.value || 0
    return typeof val === 'string' ? parseFloat(val.replace('%', '')) : val * 100
  })
  
  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const param = params[0]
        return `${param.name}<br/>正确率: ${param.value.toFixed(1)}%`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '正确率',
        type: 'line',
        smooth: true,
        data: values,
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ]
          }
        }
      }
    ]
  }
})

onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.study-home {
  padding: 20px;
}

.entry-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

/* 主要入口卡片样式（开始做题） */
.study-entry-card.primary-card {
  border: 2px solid #409EFF;
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.study-entry-card.primary-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(30%, 30%);
  }
}

.study-entry-card.primary-card .entry-icon,
.study-entry-card.primary-card .entry-title,
.study-entry-card.primary-card .entry-desc,
.study-entry-card.primary-card .entry-stats {
  color: white;
  position: relative;
  z-index: 1;
}

.study-entry-card.primary-card .entry-stats {
  font-size: 18px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 16px;
  border-radius: 20px;
  display: inline-block;
  margin-top: 8px;
}

.study-entry-card.primary-card:hover {
  border-color: #66b1ff;
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.5);
  transform: translateY(-6px) scale(1.02);
}

.overview-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #409EFF;
}

.chart-wrapper {
  min-height: 250px;
  width: 100%;
}

.chart-placeholder {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .entry-cards {
    grid-template-columns: 1fr;
  }
  
  .overview-stats {
    flex-direction: column;
    gap: 20px;
  }
}
</style>

