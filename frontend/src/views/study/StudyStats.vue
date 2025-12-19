<template>
  <div class="study-stats">
    <el-card class="study-card">
      <div class="card-header">
        <h2 class="card-title">学习统计</h2>
      </div>
    </el-card>

    <!-- 筛选栏 -->
    <el-card class="study-card">
      <div class="study-filter-bar">
        <div class="filter-item">
          <label>时间范围：</label>
          <el-select v-model="filters.dateRange" style="width: 150px" @change="loadData">
            <el-option label="最近7天" value="7d" />
            <el-option label="最近30天" value="30d" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </div>
        <div class="filter-item" v-if="filters.dateRange === 'custom'">
          <label>开始日期：</label>
          <el-date-picker v-model="filters.startDate" type="date" style="width: 150px" />
        </div>
        <div class="filter-item" v-if="filters.dateRange === 'custom'">
          <label>结束日期：</label>
          <el-date-picker v-model="filters.endDate" type="date" style="width: 150px" />
        </div>
        <el-button @click="loadData">查询</el-button>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <div class="stats-cards" v-if="statsData">
      <el-card class="study-stat-card">
        <div class="stat-label">总做题次数</div>
        <div class="stat-value">{{ statsData.summary?.totalExercises || 0 }}</div>
      </el-card>
      <el-card class="study-stat-card">
        <div class="stat-label">总题数</div>
        <div class="stat-value">{{ statsData.summary?.totalQuestions || 0 }}</div>
      </el-card>
      <el-card class="study-stat-card">
        <div class="stat-label">平均正确率</div>
        <div class="stat-value">{{ statsData.summary?.avgAccuracy || '0.0' }}%</div>
        <div class="stat-trend" v-if="statsData.summary?.improvementRate">
          <span :class="statsData.summary.improvementRate > 0 ? 'up' : 'down'">
            {{ statsData.summary.improvementRate > 0 ? '↑' : '↓' }}
            {{ Math.abs(statsData.summary.improvementRate * 100).toFixed(1) }}%
          </span>
        </div>
      </el-card>
    </div>

    <!-- 正确率趋势图 -->
    <el-card class="study-card study-chart-container" v-loading="loading">
      <div class="chart-title">正确率趋势</div>
      <div class="chart-wrapper">
        <StudyChart 
          v-if="trendChartOption" 
          :option="trendChartOption" 
          height="350px" 
        />
        <div v-else class="chart-placeholder">
          <p style="color: #909399; text-align: center; padding: 40px;">
            暂无数据
          </p>
        </div>
      </div>
    </el-card>

    <!-- 科目/知识点分布 -->
    <el-card class="study-card study-chart-container" v-loading="loading">
      <div class="chart-title">科目分布</div>
      <div class="chart-wrapper">
        <StudyChart 
          v-if="subjectChartOption" 
          :option="subjectChartOption" 
          height="350px" 
        />
        <div v-else class="chart-placeholder">
          <p style="color: #909399; text-align: center; padding: 40px;">
            暂无数据
          </p>
        </div>
      </div>
    </el-card>

    <!-- 题型分布 -->
    <el-card class="study-card study-chart-container" v-loading="loading" v-if="questionTypeChartOption">
      <div class="chart-title">题型分布</div>
      <div class="chart-wrapper">
        <StudyChart 
          :option="questionTypeChartOption" 
          height="350px" 
        />
      </div>
    </el-card>

    <!-- 薄弱知识点 -->
    <el-card class="study-card" v-if="statsData?.weakKnowledgeTop && statsData.weakKnowledgeTop.length > 0">
      <div class="card-header">
        <div class="card-title">薄弱知识点 TOP3</div>
      </div>
      <div class="weak-knowledge-list">
        <div v-for="(item, index) in statsData.weakKnowledgeTop" :key="index" class="weak-item">
          <div class="weak-rank">{{ index + 1 }}</div>
          <div class="weak-info">
            <div class="weak-name">{{ item.knowledgeName || '未知知识点' }}</div>
            <div class="weak-stats">
              <span>正确率：{{ (item.accuracy * 100).toFixed(1) }}%</span>
              <span style="margin-left: 16px;">错题数：{{ item.wrongCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 空状态 -->
    <el-card class="study-card" v-if="!loading && !statsData">
      <div class="study-empty">
        <div class="empty-icon">📊</div>
        <div class="empty-text">暂无足够数据生成统计，建议先完成几次练习。</div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getLearningDetail } from '@/api'
import { ElMessage } from 'element-plus'
import StudyChart from '@/components/study/StudyChart.vue'
import '@/styles/study/index.scss'

const userStore = useUserStore()
const userId = computed(() => userStore.userId || 1)

const loading = ref(false)
const statsData = ref(null)

const filters = ref({
  dateRange: '7d',
  startDate: null,
  endDate: null
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      userId: userId.value
    }
    
    // 如果不是自定义，使用预设范围
    if (filters.value.dateRange !== 'custom') {
      params.range = filters.value.dateRange
    } else {
      // 自定义日期范围
      if (filters.value.startDate) {
        params.startDate = filters.value.startDate
      }
      if (filters.value.endDate) {
        params.endDate = filters.value.endDate
      }
    }
    
    const res = await getLearningDetail(params)
    const data = res?.data || res
    
    // 处理数据格式，确保字段存在
    statsData.value = {
      summary: {
        totalExercises: data?.summary?.totalExercises || 0,
        totalQuestions: data?.summary?.totalQuestions || 0,
        avgAccuracy: data?.summary?.avgAccuracy || '0.0',
        improvementRate: data?.summary?.improvementRate || 0
      },
      accuracyTrend: data?.accuracyTrend || [],
      subjectDistribution: data?.subjectDistribution || [],
      questionTypeStats: data?.questionTypeStats || [],
      weakKnowledgeTop: data?.weakKnowledgeTop || []
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载失败，请稍后重试')
    statsData.value = null
  } finally {
    loading.value = false
  }
}

// 趋势图配置
const trendChartOption = computed(() => {
  if (!statsData.value?.accuracyTrend || statsData.value.accuracyTrend.length === 0) {
    return null
  }
  
  const trendData = statsData.value.accuracyTrend
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

// 科目分布柱状图配置
const subjectChartOption = computed(() => {
  if (!statsData.value?.subjectDistribution || statsData.value.subjectDistribution.length === 0) {
    return null
  }
  
  const distData = statsData.value.subjectDistribution
  const categories = distData.map(item => item.name || item.subject || '未知')
  const values = distData.map(item => item.value || item.count || 0)
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
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
      data: categories,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '题数',
        type: 'bar',
        data: values,
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
})

// 题型分布饼图配置
const questionTypeChartOption = computed(() => {
  if (!statsData.value?.questionTypeStats || statsData.value.questionTypeStats.length === 0) {
    return null
  }
  
  const typeData = statsData.value.questionTypeStats
  const data = typeData.map(item => ({
    name: item.name || item.type || '未知',
    value: item.value || item.count || 0
  }))
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '题型分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c} ({d}%)'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        data: data
      }
    ]
  }
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.study-stats {
  padding: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.weak-knowledge-list {
  padding: 16px 0;
}

.weak-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.weak-rank {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #409EFF;
  color: #fff;
  border-radius: 50%;
  font-weight: 600;
  margin-right: 16px;
}

.weak-info {
  flex: 1;
}

.weak-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.weak-stats {
  font-size: 13px;
  color: #909399;
}

.chart-wrapper {
  min-height: 350px;
  width: 100%;
}

.chart-placeholder {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>

