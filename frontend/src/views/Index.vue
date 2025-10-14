<template>
  <el-container class="layout-container">
    <el-header>
      <Navbar />
    </el-header>
    <el-main class="main-content">
      <div class="dashboard">
        
        <!-- 快速操作 -->
        <div class="quick-actions">
          <el-card class="action-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>快速开始</span>
              </div>
            </template>
            <div class="action-buttons">
              <el-button type="primary" size="large" @click="$router.push('/index-quiz')">
                <el-icon><Document /></el-icon>
                开始做题
              </el-button>
              <el-button type="success" size="large" @click="$router.push('/index-quiz-wrong')">
                <el-icon><Warning /></el-icon>
                复习错题
              </el-button>
              <el-button type="warning" size="large" @click="$router.push('/index-quiz-favorites')">
                <el-icon><Star /></el-icon>
                我的收藏
              </el-button>
            </div>
          </el-card>
        </div>
        
        <h1 class="dashboard-title">学习仪表板</h1>
        
        <!-- 统计卡片 -->
        <div class="stats-cards">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">📚</div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalQuestions }}</div>
                <div class="stat-label">总做题数</div>
              </div>
            </div>
          </el-card>
          
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">🎯</div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalScore }}</div>
                <div class="stat-label">总得分</div>
              </div>
            </div>
          </el-card>
          
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">📈</div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.accuracy }}</div>
                <div class="stat-label">正确率</div>
              </div>
            </div>
          </el-card>
          
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">⭐</div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.favoriteCount }}</div>
                <div class="stat-label">收藏题目</div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 图表区域 -->
        <div class="charts-section">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card class="chart-card" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>分类答题分布</span>
                  </div>
                </template>
                <div id="categoryChart" class="chart-container"></div>
              </el-card>
            </el-col>
            
            <el-col :span="12">
              <el-card class="chart-card" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>难度分布</span>
                  </div>
                </template>
                <div id="difficultyChart" class="chart-container"></div>
              </el-card>
            </el-col>
          </el-row>
          
          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="24">
              <el-card class="chart-card" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>最近7天学习趋势</span>
                  </div>
                </template>
                <div id="trendChart" class="chart-container-large"></div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Document, Warning, Star } from '@element-plus/icons-vue'
import Navbar from "@/components/Navbar.vue"
import { getUserQuizStats, getQuizFavorites, getQuizCategoryStats, getQuizDifficultyStats, getQuizWeeklyTrend } from '@/api'

const stats = ref({
  totalQuestions: 0,
  totalScore: 0,
  accuracy: '0%',
  favoriteCount: 0
})

const loadStats = async () => {
  try {
    // 加载用户统计
    const statsRes = await getUserQuizStats(1)
    if (statsRes) {
      stats.value.totalQuestions = statsRes.totalQuestions || 0
      stats.value.totalScore = statsRes.totalScore || 0
      stats.value.accuracy = statsRes.accuracy || '0%'
    }

    // 加载收藏数量
    const favoritesRes = await getQuizFavorites(1)
    if (favoritesRes) {
      stats.value.favoriteCount = Array.isArray(favoritesRes) ? favoritesRes.length : (favoritesRes?.data?.length || 0)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const initCharts = async () => {
  await nextTick()
  
  try {
    // 获取真实数据
    const [categoryData, difficultyData, trendData] = await Promise.all([
      getQuizCategoryStats(1),
      getQuizDifficultyStats(1),
      getQuizWeeklyTrend(1)
    ])

    // 分类分布饼图
    const categoryChart = window.echarts.init(document.getElementById('categoryChart'))
    const categoryOption = {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{
        name: '答题分布',
        type: 'pie',
        radius: ['40%', '70%'],
        data: Array.isArray(categoryData) ? categoryData : (categoryData?.data || []),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    }
    categoryChart.setOption(categoryOption)

    // 难度分布柱状图
    const difficultyChart = window.echarts.init(document.getElementById('difficultyChart'))
    const difficultyOption = {
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: (Array.isArray(difficultyData) ? difficultyData : (difficultyData?.data || [])).map(item => item.name)
      },
      yAxis: { type: 'value' },
      series: [{
        name: '题目数量',
        type: 'bar',
        data: (Array.isArray(difficultyData) ? difficultyData : (difficultyData?.data || [])).map(item => item.value),
        itemStyle: {
          color: function(params) {
            const colors = ['#67c23a', '#e6a23c', '#f56c6c']
            return colors[params.dataIndex] || '#409eff'
          }
        }
      }]
    }
    difficultyChart.setOption(difficultyOption)

    // 学习趋势折线图
    const trendChart = window.echarts.init(document.getElementById('trendChart'))
    const weekData = Array.isArray(trendData) ? trendData : (trendData?.data || [])
    const trendOption = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['做题数', '得分'] },
      xAxis: {
        type: 'category',
        data: weekData.map(item => item.day)
      },
      yAxis: [
        { type: 'value', name: '题目数' },
        { type: 'value', name: '得分' }
      ],
      series: [
        {
          name: '做题数',
          type: 'line',
          data: weekData.map(item => item.questions),
          smooth: true,
          itemStyle: { color: '#409eff' }
        },
        {
          name: '得分',
          type: 'line',
          yAxisIndex: 1,
          data: weekData.map(item => item.score),
          smooth: true,
          itemStyle: { color: '#67c23a' }
        }
      ]
    }
    trendChart.setOption(trendOption)

    // 响应式调整
    window.addEventListener('resize', () => {
      categoryChart.resize()
      difficultyChart.resize()
      trendChart.resize()
    })
  } catch (error) {
    console.error('加载图表数据失败:', error)
  }
}

onMounted(async () => {
  await loadStats()
  await initCharts()
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.main-content {
  padding: 20px;
  background: #f5f7fa;
}

.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-title {
  text-align: center;
  color: #303133;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  border-radius: 12px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #409eff, #67c23a);
  border-radius: 12px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.charts-section {
  margin-bottom: 30px;
}

.chart-card {
  border-radius: 12px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  height: 300px;
}

.chart-container-large {
  height: 400px;
}

.quick-actions {
  margin-top: 20px;
}

.action-card {
  border-radius: 12px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  min-width: 150px;
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons .el-button {
    width: 200px;
  }
}
</style>