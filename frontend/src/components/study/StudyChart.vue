<template>
  <div ref="chartRef" :style="{ width: width, height: height }"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  // 图表配置
  option: {
    type: Object,
    required: true
  },
  // 宽度
  width: {
    type: String,
    default: '100%'
  },
  // 高度
  height: {
    type: String,
    default: '300px'
  },
  // 是否自动调整大小
  autoResize: {
    type: Boolean,
    default: true
  }
})

const chartRef = ref(null)
let chartInstance = null

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  // 如果已存在实例，先销毁
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  // 创建新实例
  chartInstance = echarts.init(chartRef.value)
  
  // 设置配置
  if (props.option) {
    chartInstance.setOption(props.option, true)
  }
  
  // 自动调整大小
  if (props.autoResize) {
    window.addEventListener('resize', handleResize)
  }
}

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 监听配置变化
watch(() => props.option, (newOption) => {
  if (chartInstance && newOption) {
    chartInstance.setOption(newOption, true)
  }
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onBeforeUnmount(() => {
  if (chartInstance) {
    if (props.autoResize) {
      window.removeEventListener('resize', handleResize)
    }
    chartInstance.dispose()
    chartInstance = null
  }
})

// 暴露方法供父组件调用
defineExpose({
  getInstance: () => chartInstance,
  resize: () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  }
})
</script>

<style scoped>
/* 图表容器样式 */
</style>

