# AI UI 生成提示词
## maidai 首页设计

> 📅 创建日期: 2024-12-17  
> 👤 设计者: Sally (UX Expert)  
> 🎯 用途: 用于 v0.dev、Lovable 等 AI UI 生成工具

---

## 提示词 1: 完整首页设计

```
Design a modern, clean personal dashboard homepage for "maidai" - a personal management system.

## Layout Structure

1. **Welcome Header Section** (top)
   - Personalized greeting: "你好，[用户名]！" (Hello, [Username]!)
   - Current date and weekday: "今天是 2024年12月17日 星期二"
   - Left-aligned, 80-100px height
   - Font: 24px heading, 14px body text

2. **Quick Actions Cards** (4 cards in a row on desktop, 2x2 on tablet, stacked on mobile)
   - Card 1: Diary (📔 日记)
     - Icon: Notebook icon, blue theme (#409EFF)
     - Data: "今日情绪：未记录" (Today's mood: Not recorded)
     - Button: "写日记" (Write Diary) - primary blue button
   
   - Card 2: Photos (🖼️ 照片墙)
     - Icon: Picture icon, green theme (#67C23A)
     - Data: "共56张照片" (56 photos total)
     - Button: "上传照片" (Upload Photos) - primary green button
   
   - Card 3: Finance (💰 财务)
     - Icon: Coin icon, orange theme (#E6A23C)
     - Data: "本月支出：¥2,345" (Monthly expense: ¥2,345)
     - Button: "记一笔" (Record Expense) - primary orange button
   
   - Card 4: Study (📚 学习)
     - Icon: Reading icon, gray theme (#909399)
     - Data: "今日做题：15道" (Today's questions: 15)
     - Button: "继续学习" (Continue Learning) - primary gray button

   Card specifications:
   - Width: 280px (desktop), 100% (mobile)
   - Height: min 200px
   - Padding: 20px
   - Border radius: 12px
   - Shadow: subtle (0 1px 4px rgba(0,0,0,0.08))
   - Hover: shadow deepens + slight lift (translateY(-2px))
   - Spacing between cards: 20px

3. **Weekly Overview Section**
   - Title: "📊 本周概览" (Weekly Overview)
   - 4 statistics in a row:
     - Diary: "5 篇" (5 entries) + "连续3天" (3-day streak)
     - Photos: "+3 张" (+3 photos) + "本周新增" (This week)
     - Finance: "12 笔" (12 records) + "支出¥856" (Expense ¥856)
     - Study: "30 题" (30 questions) + "正确率 85%" (85% accuracy)
   - Card padding: 24px
   - Statistics spacing: 32px (desktop), 24px (mobile)
   - Data font: 20px, bold
   - Label font: 12px, secondary color

4. **Recent Activities Timeline** (bottom)
   - Title: "📅 最近动态" (Recent Activities)
   - Timeline with activity items:
     - "12-17 15:30 📔 写了日记「今天很开心」[查看]"
     - "12-17 12:20 💰 记账 -88元 [午餐] [详情]"
     - "12-17 10:15 🖼️ 上传了3张照片 [查看]"
     - "12-17 09:00 📚 完成10道题，正确率90% [继续]"
   - Timeline: 2px vertical line, #E4E7ED color
   - Timeline nodes: 8px circles, module theme colors
   - Item spacing: 16px
   - Time font: 12px, secondary color
   - Content font: 14px, primary text color
   - Action buttons: text links, module theme colors

## Design System

- **Color Palette:**
  - Primary: #409EFF (blue)
  - Success: #67C23A (green)
  - Warning: #E6A23C (orange)
  - Info: #909399 (gray)
  - Background: #F5F7FA
  - Card background: #FFFFFF
  - Text primary: #303133
  - Text secondary: #909399

- **Typography:**
  - Font family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif
  - Headings: 24-28px, weight 600
  - Body: 14px, weight 400
  - Small text: 12px, weight 400

- **Spacing:**
  - Base unit: 4px
  - Card padding: 20px
  - Section spacing: 24px
  - Page padding: 20px (mobile), 24px (desktop)

- **Shadows:**
  - Cards: 0 1px 4px rgba(0, 0, 0, 0.08)
  - Cards hover: 0 2px 8px rgba(0, 0, 0, 0.12)

- **Border Radius:**
  - Cards: 12px
  - Buttons: 8px

## Responsive Behavior

- **Desktop (≥992px):** 4 cards in a row, full width sections
- **Tablet (768-991px):** 2x2 card grid, adjusted spacing
- **Mobile (<768px):** Stacked cards, full width, reduced spacing

## Interactions

- Card hover: subtle shadow increase + 2px lift, 200ms transition
- Button click: scale(0.98), 100ms transition
- Page transitions: fade in/out, 200ms
- Loading states: skeleton screens for data loading

## Accessibility

- All interactive elements: min 44x44px touch target
- Color contrast: ≥4.5:1 for text
- Keyboard navigation: Tab order logical
- Focus states: 2px primary color outline

Use modern, clean design with plenty of white space. The design should feel professional yet friendly, with clear visual hierarchy and intuitive interactions.
```

---

## 提示词 2: 快速操作卡片组件

```
Create a reusable Quick Action Card component for a personal management dashboard.

## Component Structure

```
┌─────────────────────┐
│  [Icon]  [Title]    │
│                     │
│  [Data Display]     │
│  [Data Label]       │
│                     │
│  [Action Button]    │
└─────────────────────┘
```

## Props

- `icon`: Icon component (Notebook, Picture, Coin, Reading)
- `title`: String (e.g., "日记", "照片墙", "财务", "学习")
- `data`: String (e.g., "今日情绪：未记录", "共56张照片")
- `dataLabel`: String (optional, e.g., "今日情绪", "照片总数")
- `buttonText`: String (e.g., "写日记", "上传照片")
- `theme`: String ("blue" | "green" | "orange" | "gray")
- `onClick`: Function

## Styling

- **Container:**
  - Width: 280px (desktop), 100% (mobile)
  - Min height: 200px
  - Padding: 20px
  - Border radius: 12px
  - Background: white
  - Shadow: 0 1px 4px rgba(0, 0, 0, 0.08)
  - Transition: all 0.2s ease

- **Hover State:**
  - Shadow: 0 2px 8px rgba(0, 0, 0, 0.12)
  - Transform: translateY(-2px)

- **Icon:**
  - Size: 32x32px
  - Color: theme color
  - Margin bottom: 12px

- **Title:**
  - Font: 18px, weight 500
  - Color: #303133
  - Margin bottom: 16px

- **Data Display:**
  - Font: 24px, weight 600
  - Color: #303133
  - Margin bottom: 4px

- **Data Label:**
  - Font: 12px, weight 400
  - Color: #909399
  - Margin bottom: 16px

- **Button:**
  - Height: 32px
  - Padding: 10px 20px
  - Border radius: 8px
  - Background: theme color
  - Color: white
  - Font: 14px
  - Width: 100%
  - Hover: background darkens 10%
  - Active: scale(0.98)

## Theme Colors

- Blue: #409EFF (Diary)
- Green: #67C23A (Photos)
- Orange: #E6A23C (Finance)
- Gray: #909399 (Study)

## Responsive

- Desktop: fixed 280px width
- Tablet: 48% width (2 columns)
- Mobile: 100% width (stacked)

Make it clean, modern, and visually appealing with smooth hover interactions.
```

---

## 提示词 3: 最近动态时间线组件

```
Design a Recent Activities Timeline component showing user's recent actions across different modules.

## Component Structure

```
┌─────────────────────────────────────┐
│  📅 最近动态                          │
├─────────────────────────────────────┤
│  ● 12-17 15:30                      │
│    📔 写了日记「今天很开心」  [查看]  │
│                                      │
│  ● 12-17 12:20                      │
│    💰 记账 -88元 [午餐]      [详情]  │
│                                      │
│  ● 12-17 10:15                      │
│    🖼️ 上传了3张照片          [查看]  │
└─────────────────────────────────────┘
```

## Data Structure

```typescript
interface Activity {
  id: string;
  type: 'diary' | 'photos' | 'finance' | 'study';
  time: string; // "12-17 15:30"
  title: string; // "写了日记「今天很开心」"
  actionText?: string; // "查看" | "详情" | "继续"
  actionUrl?: string;
}
```

## Styling

- **Container:**
  - Background: white
  - Padding: 24px
  - Border radius: 12px
  - Shadow: 0 1px 4px rgba(0, 0, 0, 0.08)

- **Title:**
  - Font: 20px, weight 600
  - Color: #303133
  - Margin bottom: 20px

- **Timeline:**
  - Position: left side
  - Width: 2px
  - Color: #E4E7ED
  - Height: 100%

- **Timeline Node:**
  - Size: 8px circle
  - Position: on timeline, aligned with activity
  - Color: module theme color
  - Border: 2px white (to separate from timeline)

- **Activity Item:**
  - Padding left: 32px (to account for timeline)
  - Margin bottom: 16px
  - Position: relative

- **Time:**
  - Font: 12px, weight 400
  - Color: #909399
  - Margin bottom: 4px

- **Content:**
  - Font: 14px, weight 400
  - Color: #303133
  - Display: flex, align items center
  - Gap: 8px

- **Icon:**
  - Size: 16px
  - Color: module theme color

- **Action Link:**
  - Font: 14px
  - Color: module theme color
  - Text decoration: none
  - Margin left: auto
  - Hover: underline

## Module Theme Colors

- Diary: #409EFF (blue)
- Photos: #67C23A (green)
- Finance: #E6A23C (orange)
- Study: #909399 (gray)

## Interactions

- Activity item hover: subtle background change (#F5F7FA)
- Action link hover: underline
- Click activity: navigate to detail page
- Smooth transitions: 200ms

## Empty State

If no activities:
- Icon: clock icon, 48px, #C0C4CC
- Text: "暂无动态" (No activities yet)
- Subtext: "开始使用各模块功能，动态会显示在这里"
- Center aligned

## Loading State

- Skeleton: 3-5 placeholder items
- Animated shimmer effect
- Same layout as actual items

Make it clean, readable, and easy to scan. The timeline should provide clear visual hierarchy.
```

---

## 提示词 4: 本周概览统计组件

```
Create a Weekly Overview statistics component displaying summary data for all modules.

## Component Structure

```
┌─────────────────────────────────────┐
│  📊 本周概览                         │
├─────────────────────────────────────┤
│  日记    照片墙    财务     学习     │
│  ━━━━    ━━━━      ━━━━     ━━━━    │
│  5 篇    +3 张     12 笔    30 题    │
│  连续3天 本周新增  支出¥856 正确率85%│
└─────────────────────────────────────┘
```

## Data Structure

```typescript
interface WeeklyStats {
  diary: {
    count: number; // 5
    label: string; // "连续3天"
  };
  photos: {
    count: number; // 3
    label: string; // "本周新增"
  };
  finance: {
    count: number; // 12
    label: string; // "支出¥856"
  };
  study: {
    count: number; // 30
    label: string; // "正确率 85%"
  };
}
```

## Styling

- **Container:**
  - Background: white
  - Padding: 24px
  - Border radius: 12px
  - Shadow: 0 1px 4px rgba(0, 0, 0, 0.08)

- **Title:**
  - Font: 20px, weight 600
  - Color: #303133
  - Margin bottom: 24px

- **Stats Grid:**
  - Display: grid
  - Columns: 4 (desktop), 2 (tablet), 1 (mobile)
  - Gap: 32px (desktop), 24px (tablet/mobile)

- **Stat Item:**
  - Text align: center (optional) or left
  - Padding: 16px
  - Border radius: 8px
  - Background: #F5F7FA (optional, for visual separation)

- **Module Name:**
  - Font: 14px, weight 500
  - Color: #606266
  - Margin bottom: 8px

- **Divider:**
  - Width: 40px
  - Height: 2px
  - Background: module theme color
  - Margin: 8px auto

- **Count:**
  - Font: 20px, weight 600
  - Color: #303133
  - Margin bottom: 4px

- **Label:**
  - Font: 12px, weight 400
  - Color: #909399

## Module Theme Colors

- Diary: #409EFF (blue)
- Photos: #67C23A (green)
- Finance: #E6A23C (orange)
- Study: #909399 (gray)

## Responsive

- Desktop: 4 columns, 32px gap
- Tablet: 2 columns, 24px gap
- Mobile: 1 column, 24px gap

## Animations

- Count numbers: animate on load (count up from 0)
- Duration: 500ms
- Easing: ease-out

Make it clean and scannable. The statistics should be easy to compare at a glance.
```

---

## 使用说明

### 对于 v0.dev

1. 复制"提示词 1: 完整首页设计"
2. 粘贴到 v0.dev 的提示框
3. 选择 React + Tailwind CSS
4. 生成后根据实际需求微调

### 对于 Lovable

1. 使用"提示词 2-4"分别生成各个组件
2. 在项目中组合使用
3. 根据设计规范调整样式

### 对于其他 AI 工具

- 根据工具特点调整提示词格式
- 保留核心设计要求和规格
- 添加工具特定的指令

---

## 设计参考

- 参考文档：[前端设计规范](./frontend-design-spec.md)
- 产品需求：[PRD 文档](./prd-frontend-optimization.md)

---

*— End of Document —*

*— Sally | UX Expert —*


