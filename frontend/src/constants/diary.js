/**
 * 日记模块常量定义
 */

// 情绪类型
export const MOOD_TYPES = ['happy', 'good', 'neutral', 'sad', 'angry']

// 情绪标签配置
export const MOOD_LABELS = {
  happy: { emoji: '😄', label: '开心', color: '#67C23A' },
  good: { emoji: '😊', label: '平静', color: '#409EFF' },
  neutral: { emoji: '😐', label: '一般', color: '#909399' },
  sad: { emoji: '😢', label: '低落', color: '#E6A23C' },
  angry: { emoji: '😠', label: '烦躁', color: '#F56C6C' }
}

// 获取情绪信息的工具函数
export const getMoodInfo = (mood) => {
  return MOOD_LABELS[mood] || MOOD_LABELS.neutral
}

// 星期映射
export const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

// 格式化日期显示
export const formatDiaryDate = (dateStr) => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekday = WEEKDAYS[date.getDay()]
  return `${year}-${month}-${day} ${weekday}`
}

