# 日记模块 AI 前端提示词

> 📅 创建日期: 2024-12-17  
> 🎨 生成者: Sally (UX Expert)  
> 🎯 适用工具: v0.dev, Lovable.ai, Bolt.new, Cursor AI

---

## 使用说明

本文档包含3个独立的AI前端提示词，用于生成日记模块的核心组件。

### 推荐使用顺序

```
1. 情绪选择器 (基础组件)
        ↓
2. 编辑弹窗 (依赖情绪选择器)
        ↓
3. 主页面 (整合所有组件)
```

### 使用技巧

1. **逐个生成**：不要一次性生成所有内容，按顺序逐个生成
2. **审查调整**：每次生成后进行代码审查和调整
3. **上下文关联**：生成后续组件时，将前一个组件的代码作为上下文提供
4. **迭代优化**：如果结果不理想，可以追加指令进行优化

---

## 提示词 1：情绪选择器组件

**复制以下内容到 AI 工具中：**

````markdown
## High-Level Goal
Create a reusable MoodSelector Vue 3 component for selecting emotions in a diary app. The component should have 5 emotion options displayed horizontally with emoji icons and animated selection feedback.

## Tech Stack
- Vue 3 Composition API (<script setup>)
- Pure CSS animations (no animation libraries)
- v-model support for two-way binding

## Visual Design

### Layout
- Horizontal row of 5 emotion options
- Each option: emoji (32px) + label text (12px) stacked vertically
- Spacing: 24px between options
- Center aligned

### Emotions
1. 😄 开心 (happy) - #67C23A
2. 😊 平静 (good) - #409EFF  
3. 😐 一般 (neutral) - #909399
4. 😢 低落 (sad) - #E6A23C
5. 😠 烦躁 (angry) - #F56C6C

### States & Animations
- Default: emoji at 80% opacity, grayscale filter
- Hover: scale(1.1), remove grayscale, show background circle
- Selected: scale(1.2), full color, colored background circle, bounce animation
- The bounce animation should overshoot (scale to 1.3 then settle at 1.2)

## Detailed Instructions

1. Create component with these props:
   - modelValue: string (the selected mood value)
   - disabled: boolean (default false)
   - compact: boolean (hides text labels when true, for mobile)

2. Emit 'update:modelValue' on selection

3. Add keyboard accessibility:
   - role="radiogroup" on container
   - role="radio" on each option
   - aria-checked attribute
   - Tab navigation between options
   - Enter/Space to select

4. CSS animations:
```css
@keyframes mood-bounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1.2); }
}
```

5. Respect prefers-reduced-motion media query

## Component API

```vue
<MoodSelector v-model="form.mood" />
<MoodSelector v-model="form.mood" compact />
<MoodSelector v-model="form.mood" disabled />
```

## Mood Constants (export for reuse)

```javascript
export const MOOD_LABELS = {
  happy: { emoji: '😄', label: '开心', color: '#67C23A' },
  good: { emoji: '😊', label: '平静', color: '#409EFF' },
  neutral: { emoji: '😐', label: '一般', color: '#909399' },
  sad: { emoji: '😢', label: '低落', color: '#E6A23C' },
  angry: { emoji: '😠', label: '烦躁', color: '#F56C6C' }
};
```

## Constraints
- No external dependencies
- Must work standalone without Element Plus
- Export mood constants for reuse
- Support both light and dark backgrounds
- All labels in Chinese
````

---

## 提示词 2：日记编辑弹窗

**复制以下内容到 AI 工具中：**

````markdown
## High-Level Goal
Create a diary edit dialog component using Vue 3 + Element Plus. The dialog handles both creating new diaries and editing existing ones, with mood selection, date picker, content input, image upload, and tags.

## Tech Stack
- Vue 3 Composition API (<script setup>)
- Element Plus (el-dialog, el-input, el-date-picker, el-upload, el-tag, el-button)
- Scoped CSS

## Dialog Structure

### Header
- Title: "✏️ 写日记" (new) or "✏️ 编辑日记" (edit)
- Close button (X)

### Form Fields (top to bottom)

1. **MoodSelector** (required)
   - Label: "今天心情如何？"
   - Use custom MoodSelector component (assume it exists)
   - Validation: must select before save

2. **Date Picker**
   - Label: "日期 📅"
   - el-date-picker type="date"
   - Default: today
   - Allow past dates (for backfilling)

3. **Title Input** (optional)
   - Label: "标题（可选）"
   - el-input with placeholder "给今天取个标题..."
   - Max length: 200

4. **Content Textarea**
   - Label: "写点什么吧..."
   - el-input type="textarea"
   - autosize with min-rows=4
   - No max length (encourage writing)

5. **Expandable Section** (collapsed by default)
   - Toggle button: "📷 添加图片  🏷️ 添加标签"
   
6. **Image Upload** (when expanded)
   - el-upload list-type="picture-card"
   - Max 9 images
   - Accept: image/jpeg, image/png, image/gif
   - Max size: 5MB per image
   - Show preview with delete option

7. **Tags Input** (when expanded)
   - el-tag components for existing tags (closable)
   - Input field to add new tag (press Enter to add)
   - Max 10 tags

### Footer
- Cancel button (text style)
- Save button (primary, disabled until mood selected)
- Loading state on save

## Detailed Instructions

1. Props:
```typescript
interface Props {
  visible: boolean  // v-model for dialog visibility
  diary?: {         // null = create mode, object = edit mode
    id?: number
    title?: string
    content: string
    mood: string
    diary_date: string
    images?: string[]
    tags?: string[]
  } | null
}
```

2. Emits:
```typescript
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'saved': [diary: DiaryForm]
}>()
```

3. Form validation:
   - Mood is required (show error tooltip if missing on save)
   - Images compressed to max 500KB before adding to form

4. Animation:
   - Dialog content fields appear sequentially (stagger animation)
   - 50ms delay between each field
   - Use CSS animation with animation-delay

5. On save success:
   - Button shows checkmark icon briefly (500ms)
   - Emit saved event with diary data
   - Close dialog

6. Image compression helper:
```javascript
const compressImage = async (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = URL.createObjectURL(file)
  })
}
```

## Mobile Responsive (≤767px)
- Dialog becomes fullscreen (width: 100%, height: 100%, margin: 0)
- Mood selector shows only emojis (compact mode)
- Larger touch targets (min 44px)
- Body scrollable with max-height

## Sample Usage
```vue
<DiaryEdit 
  v-model:visible="editDialogVisible"
  :diary="currentDiary"
  @saved="handleSaved"
/>
```

## Constraints
- Do NOT auto-save or use debounce
- Do NOT persist to localStorage
- Image compression must happen client-side
- All validation messages and labels in Chinese
- Use Element Plus components only (no custom form controls except MoodSelector)
````

---

## 提示词 3：日记主页面

**复制以下内容到 AI 工具中：**

````markdown
## High-Level Goal
Create a responsive diary module main page for a personal management app using Vue 3 + Element Plus + ECharts. The page displays a diary list with emotion filtering, and an emotion statistics panel with a pie chart.

## Tech Stack & Context
- Framework: Vue 3 with Composition API (<script setup>)
- UI Library: Element Plus
- Charts: ECharts 5
- Styling: Scoped CSS with CSS variables
- Language: Chinese (zh-CN)
- Assume MoodSelector and DiaryEdit components already exist

## Visual Style
- Color Palette: 
  - Primary: #409EFF (blue)
  - Success/Happy: #67C23A (green)
  - Warning/Sad: #E6A23C (orange)
  - Danger/Angry: #F56C6C (red)
  - Neutral: #909399 (gray)
- Typography: System fonts, 14px base, 1.6 line-height
- Spacing: 8px base unit (sm), 16px (md), 24px (lg)
- Style: Warm, personal, calming - not clinical or social-media-like

## Page Structure

### Layout (Desktop: 1024px+)
```
┌─────────────────────────────────────────────────────────┐
│  📔 我的日记                  [🔍搜索] [😄筛选] [➕新建] │
├───────────────────────────────────┬─────────────────────┤
│                                   │  📊 情绪统计        │
│   ┌─────────────────────────┐    │                     │
│   │ DiaryCard               │    │    [饼图]           │
│   └─────────────────────────┘    │                     │
│   ┌─────────────────────────┐    │  😄 开心  15 (48%)  │
│   │ DiaryCard               │    │  😊 平静   8 (26%)  │
│   └─────────────────────────┘    │  ...                │
│   ┌─────────────────────────┐    │                     │
│   │ DiaryCard               │    │  🔥 连续记录: 7天   │
│   └─────────────────────────┘    │                     │
│                                   │                     │
│         [分页]                    │                     │
├───────────────────────────────────┴─────────────────────┤
│  左侧: 62.5% (15/24栏)    右侧: 37.5% (9/24栏)          │
└─────────────────────────────────────────────────────────┘
```

## Detailed Instructions

### 1. Top Action Bar
- Page title: "📔 我的日记" (h1, 24px, font-weight: 600)
- Search input: el-input with prefix icon, placeholder "搜索日记..."
- Emotion filter: el-select with 5 mood options + "全部" option
- Date filter: el-date-picker type="month", default current month
- New button: el-button type="primary" with Plus icon, text "新建"

### 2. Diary Card Component
Create a DiaryCard sub-component with:

```vue
<template>
  <div class="diary-card" :style="{ '--mood-color': moodColor }">
    <div class="card-header">
      <span class="mood-badge">{{ moodEmoji }} {{ moodLabel }}</span>
      <span class="date">{{ formatDate(diary.diary_date) }}</span>
    </div>
    <h3 class="card-title" v-if="diary.title">{{ diary.title }}</h3>
    <p class="card-content">{{ truncateContent(diary.content) }}</p>
    <div class="card-images" v-if="diary.images?.length">
      <img v-for="(img, i) in diary.images.slice(0, 3)" :key="i" :src="img" />
    </div>
    <div class="card-tags" v-if="diary.tags?.length">
      <el-tag v-for="tag in diary.tags" :key="tag" size="small">{{ tag }}</el-tag>
    </div>
    <div class="card-actions">
      <el-button text @click="$emit('view')">👁️ 查看</el-button>
      <el-button text @click="$emit('edit')">✏️</el-button>
      <el-popconfirm title="确定删除这篇日记吗？" @confirm="$emit('delete')">
        <template #reference>
          <el-button text type="danger">🗑️</el-button>
        </template>
      </el-popconfirm>
    </div>
  </div>
</template>
```

Card styling:
- White background, border-radius: 8px
- Left border: 4px solid var(--mood-color)
- Padding: 16px
- Hover: translateY(-2px), box-shadow, transition 200ms

### 3. Statistics Panel
- Title: "📊 情绪统计"
- ECharts pie chart:
  - Colors: ['#67C23A', '#409EFF', '#909399', '#E6A23C', '#F56C6C']
  - Animation: 800ms, easing cubicOut
  - Click event: filter diary list by emotion
- Legend below chart with emoji + label + count + percentage
- Streak counter: "🔥 连续记录: X天"

ECharts option:
```javascript
const chartOption = {
  tooltip: { trigger: 'item' },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    data: moodStats.value,
    itemStyle: { borderRadius: 4 },
    label: { show: false },
    emphasis: { 
      itemStyle: { shadowBlur: 10 }
    }
  }]
}
```

### 4. Empty State
When no diaries exist:
```vue
<el-empty description="还没有日记，开始记录今天的心情吧！">
  <el-button type="primary" @click="openNewDiary">
    ✏️ 写第一篇日记
  </el-button>
</el-empty>
```

### 5. Pagination
- el-pagination at bottom of list
- layout: "prev, pager, next, total"
- page-size: 10
- Show total count

## Responsive Behavior

### Tablet (768px - 1023px)
- Single column layout
- Statistics panel moves to top, collapsed by default
- Show compact stats row: "😄15 😊8 😐5 😢2 😠1"
- Toggle button to expand full stats

### Mobile (≤767px)
- Full width layout, 12px padding
- Statistics completely hidden, show "📊 查看统计" button
- Cards simplified: hide image previews, hide title if empty
- Action buttons in el-dropdown menu
- Pagination simplified: prev/next only

## API Integration (Mock Data Structure)

```javascript
// Diary list API response
const diaryListResponse = {
  code: 0,
  msg: "success",
  data: {
    list: [
      {
        id: 1,
        title: "今天很开心",
        content: "完成了日记模块的开发，感觉很有成就感！",
        mood: "happy",
        diary_date: "2024-12-17",
        images: [],
        tags: ["工作", "编程"],
        created_at: "2024-12-17T10:30:00Z"
      }
    ],
    total: 31,
    page: 1,
    pageSize: 10
  }
}

// Mood stats API response
const moodStatsResponse = {
  code: 0,
  data: [
    { name: "开心", value: 15, mood: "happy" },
    { name: "平静", value: 8, mood: "good" },
    { name: "一般", value: 5, mood: "neutral" },
    { name: "低落", value: 2, mood: "sad" },
    { name: "烦躁", value: 1, mood: "angry" }
  ]
}
```

## Mood Constants (import from shared)
```javascript
import { MOOD_LABELS } from '@/constants/diary'

// MOOD_LABELS = {
//   happy: { emoji: '😄', label: '开心', color: '#67C23A' },
//   good: { emoji: '😊', label: '平静', color: '#409EFF' },
//   neutral: { emoji: '😐', label: '一般', color: '#909399' },
//   sad: { emoji: '😢', label: '低落', color: '#E6A23C' },
//   angry: { emoji: '😠', label: '烦躁', color: '#F56C6C' }
// }
```

## Constraints
- Do NOT use Pinia or Vuex - use component-level ref/reactive
- Do NOT create separate route pages - use dialogs for view/edit
- Use Element Plus components exclusively
- All text must be in Chinese
- Card list should have stagger animation on load (50ms delay each)
````

---

## 附加提示词（可选）

### 情绪饼图组件（独立）

````markdown
## Goal
Create a MoodChart Vue 3 component that displays emotion distribution as an ECharts pie chart with click interaction.

## Props
- data: Array<{ name: string, value: number, mood: string }>
- loading: boolean

## Features
- Donut style pie chart (40%-70% radius)
- Colors match emotion palette
- Click on slice emits 'select' event with mood value
- Smooth 800ms animation on data change
- Empty state when no data

## Emit
- select: (mood: string) => void
````

### 日记详情弹窗（独立）

````markdown
## Goal
Create a DiaryDetail dialog component for viewing a diary entry in read-only mode.

## Features
- Large emotion emoji at top (48px)
- Date and weekday display
- Full content with proper line breaks
- Image gallery (click to enlarge)
- Tags display
- Footer with Edit and Delete buttons
- Responsive: fullscreen on mobile
````

---

## ⚠️ 重要提醒

> **所有AI生成的代码都需要人工审查、测试和优化才能用于生产环境。**

### 生成后检查清单

- [ ] 代码语法正确，无报错
- [ ] 组件props和events符合项目规范
- [ ] 样式与现有系统一致
- [ ] 响应式布局在各断点正确显示
- [ ] 无障碍属性正确添加
- [ ] 中文文本无乱码
- [ ] 动画流畅，无卡顿
- [ ] 与后端API对接正确

---

*— End of AI Prompts Document —*

