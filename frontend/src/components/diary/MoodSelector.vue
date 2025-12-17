<template>
  <div class="mood-selector" :class="{ compact: compact }">
    <div class="mood-label" v-if="!compact">今天心情如何？</div>
    <div class="mood-options">
      <div 
        v-for="mood in MOOD_TYPES" 
        :key="mood"
        class="mood-item"
        :class="{ active: modelValue === mood }"
        :style="{ '--mood-color': MOOD_LABELS[mood].color }"
        @click="selectMood(mood)"
      >
        <span class="mood-emoji">{{ MOOD_LABELS[mood].emoji }}</span>
        <span class="mood-text" v-if="!compact">{{ MOOD_LABELS[mood].label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MOOD_TYPES, MOOD_LABELS } from '@/constants/diary.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const selectMood = (mood) => {
  emit('update:modelValue', mood)
}
</script>

<style scoped>
.mood-selector {
  padding: 16px 0;
}

.mood-label {
  font-size: 15px;
  color: #606266;
  margin-bottom: 12px;
  font-weight: 500;
}

.mood-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.mood-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  min-width: 70px;
}

.mood-item:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
}

.mood-item.active {
  background: linear-gradient(135deg, var(--mood-color) 0%, var(--mood-color) 100%);
  border-color: var(--mood-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: bounce 0.4s ease;
}

.mood-item.active .mood-emoji {
  animation: pulse-emoji 0.6s ease;
}

.mood-item.active .mood-text {
  color: #fff;
  font-weight: 600;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  30% { transform: translateY(-8px) scale(1.05); }
  60% { transform: translateY(-4px) scale(1.02); }
}

@keyframes pulse-emoji {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.mood-emoji {
  font-size: 28px;
  transition: transform 0.3s ease;
}

.mood-text {
  font-size: 13px;
  color: #606266;
  transition: color 0.3s ease;
}

/* Compact 模式 */
.mood-selector.compact .mood-options {
  gap: 8px;
}

.mood-selector.compact .mood-item {
  padding: 8px 12px;
  min-width: auto;
  border-radius: 8px;
}

.mood-selector.compact .mood-emoji {
  font-size: 22px;
}

/* 响应式 */
@media (max-width: 768px) {
  .mood-options {
    gap: 8px;
  }
  
  .mood-item {
    padding: 10px 12px;
    min-width: 60px;
  }
  
  .mood-emoji {
    font-size: 24px;
  }
  
  .mood-text {
    font-size: 12px;
  }
}
</style>

