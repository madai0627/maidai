<template>
  <div class="mood-chart-container">
    <!-- 加载状态 -->
    <div class="loading-mask" v-if="loading">
      <el-skeleton :rows="0" animated>
        <template #template>
          <div class="skeleton-chart"></div>
        </template>
      </el-skeleton>
    </div>
    
    <!-- 空数据状态 -->
    <div class="empty-state" v-else-if="isEmpty">
      <div class="empty-icon">📊</div>
      <div class="empty-text">暂无情绪数据</div>
      <div class="empty-hint">记录日记后这里将显示情绪分布</div>
    </div>
    
    <!-- 图表 -->
    <div ref="chartRef" class="chart-dom" v-show="!loading && !isEmpty"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { MOOD_LABELS } from '@/constants/diary.js'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const chartRef = ref(null)
let chartInstance = null

// 是否为空数据
const isEmpty = computed(() => {
  return !props.data || props.data.length === 0 || props.data.every(d => d.value === 0)
})

// 初始化图表
const initChart = () => {
  if (!chartRef.value || !window.echarts) return
  
  chartInstance = window.echarts.init(chartRef.value)
  
  // 监听点击事件
  chartInstance.on('click', (params) => {
    if (params.data?.mood) {
      emit('select', params.data.mood)
    }
  })
  
  updateChart()
}

// 更新图表
const updateChart = () => {
  if (!chartInstance || isEmpty.value) return
  
  const chartData = props.data
    .filter(item => item.value > 0)
    .map(item => ({
      name: MOOD_LABELS[item.mood]?.label || item.name,
      value: item.value,
      mood: item.mood,
      itemStyle: {
        color: MOOD_LABELS[item.mood]?.color || '#909399'
      }
    }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const emoji = MOOD_LABELS[params.data.mood]?.emoji || ''
        return `${emoji} ${params.name}<br/>数量: ${params.value} 篇<br/>占比: ${params.percent}%`
      }
    },
    series: [{
      type: 'pie',
      radius: ['35%', '60%'],  // 缩小半径，留出label空间
      center: ['50%', '50%'],
      data: chartData,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'outside',
        formatter: (params) => {
          const emoji = MOOD_LABELS[params.data.mood]?.emoji || ''
          return `${emoji} ${params.percent}%`
        },
        fontSize: 11,
        color: '#606266',
        overflow: 'none'
      },
      labelLine: {
        show: true,
        length: 8,
        length2: 10,
        smooth: true
      },
      emphasis: {
        scale: true,
        scaleSize: 6,
        itemStyle: {
          shadowBlur: 15,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        }
      },
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDuration: 800,
      animationDelay: (idx) => idx * 100
    }]
  }
  
  chartInstance.setOption(option, true)
}

// 调整大小
const resizeChart = () => {
  chartInstance?.resize()
}

// 监听数据变化
watch(() => props.data, () => {
  nextTick(() => updateChart())
}, { deep: true })

// 监听loading变化
watch(() => props.loading, (newVal) => {
  if (!newVal) {
    nextTick(() => {
      if (!chartInstance) {
        initChart()
      } else {
        updateChart()
      }
    })
  }
})

onMounted(() => {
  nextTick(() => {
    if (!props.loading) {
      initChart()
    }
  })
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<style scoped>
.mood-chart-container {
  width: 100%;
  height: 240px;  /* 优化高度，配合缩小的饼图 */
  position: relative;
  padding: 10px 0;
}

.chart-dom {
  width: 100%;
  height: 100%;
}

.loading-mask {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-chart {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 50%, #f2f2f2 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.empty-state {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.6;
}

.empty-text {
  font-size: 15px;
  color: #606266;
}

.empty-hint {
  font-size: 13px;
  color: #909399;
}
</style>

