# 日记模块 棕地增强架构文档

> 📅 创建日期: 2024-12-17  
> 🏗️ 架构师: Winston  
> 📊 版本: v1.0  
> 📄 关联文档: [docs/brief-diary.md](./brief-diary.md)

---

## 1. 引言 (Introduction)

### 文档概述

本文档定义了 **日记模块 (Diary Module)** 在现有 maidai 个人管理系统上的增强架构。作为一个棕地项目，我们的首要原则是**与现有系统无缝集成**，复用已验证的技术栈和设计模式。

**增强描述：**
为 maidai 系统新增私密日记功能，支持文字记录、情绪标签、图片附件，并提供情绪数据可视化。

### 现有项目分析

#### 当前项目状态

| 维度 | 分析结果 |
|------|---------|
| **项目定位** | 个人生活管理系统（题库学习、财务记账、宠物管理、照片墙） |
| **技术栈** | Vue 3 + NestJS + TypeORM + MySQL |
| **架构风格** | 前后端分离，RESTful API，模块化设计 |
| **部署方式** | 本地开发环境（localhost:3000 后端，Vite 前端） |

#### 前端技术栈

```
前端 (frontend/)
├── 框架: Vue 3 + Composition API (<script setup>)
├── UI库: Element Plus
├── 图表: ECharts
├── 路由: Vue Router (createWebHistory)
├── 状态: 组件内 ref/reactive（无全局状态管理）
├── HTTP: Axios 封装 (src/util/request.js)
├── 构建: Vite
└── 样式: Scoped CSS + 部分全局 style.css
```

#### 后端技术栈

```
后端 (backend/)
├── 框架: NestJS
├── ORM: TypeORM
├── 数据库: MySQL (madai)
├── 模块结构: Module + Controller + Service + Entity
├── 文件上传: Multer (FileInterceptor)
├── 图片存储: Base64 字符串存入 longtext 字段
└── API前缀: /api/{module-name}/{action}
```

#### 已识别约束

| 约束类型 | 具体约束 |
|---------|---------|
| **技术栈** | 必须使用 Vue 3 + NestJS + MySQL |
| **图片存储** | 现有方案为 Base64 存入 longtext |
| **API模式** | RESTful，路由前缀 `/api/` |
| **ORM同步** | TypeORM synchronize: true |

---

## 2. 增强范围与集成策略 (Enhancement Scope)

### 增强概述

| 属性 | 值 |
|------|---|
| **增强类型** | 新功能模块添加（Feature Addition） |
| **范围** | 中等 - 新增独立模块，轻度跨模块联动 |
| **集成影响** | 低风险 - 不修改现有模块核心逻辑 |

### 集成方式

```
集成模式：【并行扩展】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

现有系统                    日记模块（新增）
┌─────────────┐            ┌─────────────┐
│ quiz_*      │            │ diary       │
│ finance_*   │  ←─────→   │ (独立模块)  │
│ photo_wall  │  复用模式   └─────────────┘
│ cat_*       │                  │
│ users       │                  │
└─────────────┘                  ▼
       │                   与现有模块的
       │                   唯一交互点：
       └──────────────────► users (user_id 关联)

特点：
✅ 不修改任何现有模块代码
✅ 只新增文件，不改动已有文件（除路由、API入口）
✅ 复用现有技术模式，不引入新依赖
```

### 集成点清单

```
需要修改的现有文件（最小化）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

前端：
├── src/router.js              # 添加 /index-diary 路由
├── src/api/index.js           # 添加日记相关API函数
├── src/views/Index.vue        # 快速操作区添加"写日记"按钮
└── src/components/Navbar.vue  # 导航栏添加日记入口（可选）

后端：
└── src/app.module.ts          # imports 数组添加 DiaryModule

合计：4-5个现有文件需要修改（均为追加代码，不修改已有逻辑）
```

### 兼容性要求

| 兼容维度 | 要求 |
|---------|------|
| **现有API** | 不影响任何现有API的请求/响应 |
| **数据库Schema** | 不修改现有表，只新增diary表 |
| **UI/UX一致性** | 使用相同的Element Plus组件和样式变量 |
| **性能影响** | 不影响现有页面加载性能 |

---

## 3. 技术栈 (Tech Stack)

### 现有技术栈（必须沿用）

| 类别 | 当前技术 | 版本 | 在日记模块中的使用 |
|------|---------|------|-------------------|
| **前端框架** | Vue 3 | ^3.x | 所有页面组件 |
| **UI组件库** | Element Plus | ^2.x | 表单、弹窗、卡片等 |
| **图表库** | ECharts | ^5.x | 情绪分布饼图 |
| **路由** | Vue Router | ^4.x | 日记页面路由 |
| **HTTP客户端** | Axios | ^1.x | API请求 |
| **后端框架** | NestJS | ^10.x | 日记模块 |
| **ORM** | TypeORM | ^0.3.x | Diary Entity |
| **数据库** | MySQL | 8.x | diary 表 |

### 新技术引入

**🎉 无需引入任何新技术！**

| 潜在新技术 | 是否引入 | 决策理由 |
|-----------|---------|---------|
| 富文本编辑器 | ❌ 不引入 | MVP使用 textarea |
| Markdown解析器 | ❌ 不引入 | MVP不支持Markdown |
| 状态管理 (Pinia) | ❌ 不引入 | 组件内状态足够 |

---

## 4. 数据模型 (Data Models)

### Diary 实体

```typescript
// backend/src/diary/diary.entity.ts

import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index 
} from 'typeorm';

@Entity('diary')
@Index(['user_id', 'diary_date'])
@Index(['user_id', 'mood'])
export class Diary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '用户ID，关联users表' })
  user_id: number;

  @Column({ length: 200, nullable: true, comment: '日记标题（可选）' })
  title: string;

  @Column('text', { comment: '日记正文内容' })
  content: string;

  @Column({ length: 20, comment: '情绪：happy/good/neutral/sad/angry' })
  mood: string;

  @Column({ length: 20, nullable: true, comment: '天气（P2）' })
  weather: string;

  @Column({ length: 100, nullable: true, comment: '位置（P2）' })
  location: string;

  @Column('date', { comment: '日记日期' })
  diary_date: Date;

  @Column('json', { nullable: true, comment: '图片数组Base64' })
  images: string[];

  @Column('json', { nullable: true, comment: '标签数组' })
  tags: string[];

  @Column({ default: false, comment: '软删除标记' })
  is_deleted: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updated_at: Date;
}
```

### 情绪枚举定义

```typescript
export const MOOD_TYPES = {
  HAPPY: 'happy',      // 😄 开心
  GOOD: 'good',        // 😊 平静
  NEUTRAL: 'neutral',  // 😐 一般
  SAD: 'sad',          // 😢 低落
  ANGRY: 'angry'       // 😠 烦躁
} as const;

export const MOOD_LABELS = {
  happy: { emoji: '😄', label: '开心', color: '#67c23a' },
  good: { emoji: '😊', label: '平静', color: '#409eff' },
  neutral: { emoji: '😐', label: '一般', color: '#909399' },
  sad: { emoji: '😢', label: '低落', color: '#e6a23c' },
  angry: { emoji: '😠', label: '烦躁', color: '#f56c6c' }
};
```

### 字段设计

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | INT | PK, AUTO | 主键 |
| `user_id` | INT | NOT NULL, INDEX | 用户关联 |
| `title` | VARCHAR(200) | NULLABLE | 标题可选 |
| `content` | TEXT | NOT NULL | 日记内容 |
| `mood` | VARCHAR(20) | NOT NULL | 情绪标签 |
| `diary_date` | DATE | NOT NULL | 日记日期 |
| `images` | JSON | NULLABLE | 图片Base64数组 |
| `tags` | JSON | NULLABLE | 标签数组 |
| `is_deleted` | BOOLEAN | DEFAULT false | 软删除 |

---

## 5. 组件架构 (Component Architecture)

### 后端组件

| 组件 | 职责 |
|------|------|
| **DiaryModule** | 模块注册 |
| **DiaryController** | HTTP路由处理 |
| **DiaryService** | 业务逻辑 |
| **DiaryEntity** | 数据模型 |
| **DTOs** | 参数验证 |

### 前端组件

```
src/views/diary/
├── Index.vue              # 日记主页面
│   ├── DiaryList.vue      # 日记列表
│   │   └── DiaryCard.vue  # 日记卡片
│   ├── DiaryEdit.vue      # 编辑弹窗
│   └── DiaryStats.vue     # 统计面板

src/components/diary/
├── MoodSelector.vue       # 情绪选择器（公共）
├── DiaryCard.vue          # 日记卡片（公共）
└── MoodChart.vue          # 情绪图表（公共）
```

### 组件交互图

```
┌──────────┐    点击    ┌──────────┐    调用    ┌──────────┐
│  Navbar  │──────────▶│  Index   │──────────▶│   API    │
│ 日记入口 │            │  .vue    │            │ /diary/* │
└──────────┘            └────┬─────┘            └──────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
     DiaryList         DiaryEdit        DiaryStats
     日记列表          编辑弹窗          统计面板
```

---

## 6. API设计 (API Design)

### API端点列表

| # | 方法 | 路径 | 用途 |
|---|------|------|------|
| 1 | GET | `/api/diary/list` | 日记列表（分页筛选） |
| 2 | GET | `/api/diary/:id` | 日记详情 |
| 3 | POST | `/api/diary/create` | 创建日记 |
| 4 | PUT | `/api/diary/:id` | 更新日记 |
| 5 | DELETE | `/api/diary/:id` | 删除日记（软删除） |
| 6 | GET | `/api/diary/stats/mood` | 情绪统计 |
| 7 | GET | `/api/diary/calendar` | 日历数据 |

### 请求/响应示例

#### 创建日记

**请求：**
```json
POST /api/diary/create
{
  "userId": 1,
  "title": "今天很开心",
  "content": "完成了日记模块的开发...",
  "mood": "happy",
  "diaryDate": "2024-12-17",
  "images": ["base64..."],
  "tags": ["工作", "编程"]
}
```

**响应：**
```json
{
  "code": 0,
  "msg": "创建成功",
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "今天很开心",
    "content": "完成了日记模块的开发...",
    "mood": "happy",
    "diary_date": "2024-12-17",
    "created_at": "2024-12-17T10:30:00Z"
  }
}
```

#### 情绪统计

**请求：**
```
GET /api/diary/stats/mood?userId=1&month=2024-12
```

**响应：**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    { "name": "开心", "value": 15, "mood": "happy" },
    { "name": "平静", "value": 8, "mood": "good" },
    { "name": "一般", "value": 5, "mood": "neutral" },
    { "name": "低落", "value": 2, "mood": "sad" },
    { "name": "烦躁", "value": 1, "mood": "angry" }
  ]
}
```

### 前端API函数

```javascript
// src/api/index.js 新增

// ========== 日记模块 API ==========
export const getDiaryList = (params) => http.get('/api/diary/list', { params })
export const getDiaryDetail = (id) => http.get(`/api/diary/${id}`)
export const createDiary = (data) => http.post('/api/diary/create', data)
export const updateDiary = (id, data) => http.put(`/api/diary/${id}`, data)
export const deleteDiary = (id) => http.delete(`/api/diary/${id}`)
export const getDiaryMoodStats = (params) => http.get('/api/diary/stats/mood', { params })
export const getDiaryCalendar = (params) => http.get('/api/diary/calendar', { params })
```

---

## 7. 源码目录结构 (Source Tree)

### 新增文件清单

#### 后端新增（7个文件）

```
backend/src/diary/
├── diary.module.ts          # 模块定义
├── diary.controller.ts      # 控制器
├── diary.service.ts         # 服务层
├── diary.entity.ts          # 实体定义
└── dto/
    ├── create-diary.dto.ts  # 创建DTO
    ├── update-diary.dto.ts  # 更新DTO
    └── list-diary.dto.ts    # 列表查询DTO
```

#### 前端新增（9个文件）

```
frontend/src/
├── views/diary/
│   ├── Index.vue                    # 日记主页面
│   └── components/
│       ├── DiaryList.vue            # 日记列表
│       ├── DiaryEdit.vue            # 编辑弹窗
│       ├── DiaryDetail.vue          # 详情弹窗
│       └── DiaryStats.vue           # 统计面板
├── components/diary/
│   ├── MoodSelector.vue             # 情绪选择器
│   ├── DiaryCard.vue                # 日记卡片
│   └── MoodChart.vue                # 情绪图表
└── constants/
    └── diary.js                     # 情绪常量
```

#### 修改文件（4个）

| 文件 | 修改内容 |
|------|---------|
| `backend/src/app.module.ts` | imports添加DiaryModule |
| `frontend/src/api/index.js` | 追加7个日记API函数 |
| `frontend/src/router.js` | 添加/index-diary路由 |
| `frontend/src/views/Index.vue` | 添加"写日记"快捷按钮 |

### 文件总计

| 类型 | 数量 |
|------|------|
| 后端新增 | 7个 |
| 前端新增 | 9个 |
| 修改文件 | 4个 |
| **总计** | **20个** |

---

## 8. 编码规范 (Coding Standards)

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| **后端模块** | PascalCase | `DiaryModule` |
| **后端方法** | camelCase | `getMoodStats()` |
| **数据库字段** | snake_case | `diary_date` |
| **前端组件** | PascalCase.vue | `DiaryCard.vue` |
| **CSS类名** | kebab-case | `.diary-card` |
| **常量** | UPPER_SNAKE | `MOOD_TYPES` |

### 代码风格

- 缩进：2空格
- 引号：单引号优先
- 注释：中文
- 响应格式：`{ code, msg, data }`

### Vue组件结构

```vue
<template>
  <!-- 模板 -->
</template>

<script setup>
// 1. 导入
// 2. Props & Emits
// 3. 响应式状态
// 4. 计算属性
// 5. 方法
// 6. 生命周期
</script>

<style scoped>
/* 样式 */
</style>
```

---

## 9. 测试策略 (Testing Strategy)

### 测试方法

| 测试类型 | 覆盖范围 | MVP阶段 |
|---------|---------|--------|
| **手动功能测试** | 所有CRUD流程 | ✅ 必须 |
| **集成验证** | 数据库、路由、页面 | ✅ 必须 |
| **回归测试** | 现有核心功能 | ✅ 必须 |
| **后端单元测试** | Service核心方法 | ⚪ 可选 |

### 功能测试清单

| 测试场景 | 预期结果 |
|---------|---------|
| 创建日记 | 日记保存成功，列表刷新显示 |
| 查看日记 | 弹窗显示完整内容 |
| 编辑日记 | 修改成功，内容更新 |
| 删除日记 | 日记从列表消失 |
| 情绪统计 | 饼图正确显示情绪分布 |
| 图片上传 | 图片预览显示，保存后能查看 |

---

## 10. 安全集成 (Security Integration)

### MVP安全措施

| 安全措施 | 实现方式 | 优先级 |
|---------|---------|--------|
| **数据隔离** | 所有查询必须包含user_id | P0 |
| **输入验证** | DTO验证，防止SQL注入 | P0 |
| **软删除** | 删除只标记，数据可恢复 | P0 |
| **XSS防护** | Vue自动转义，不使用v-html | P0 |
| **图片验证** | 限制类型和大小 | P0 |

### 数据隔离实现

```typescript
// ✅ 正确：所有查询必须限定user_id
async list(params: ListDiaryDto) {
  const { userId } = params;
  return this.diaryRepo.find({
    where: { 
      user_id: userId,  // 必须条件
      is_deleted: false 
    }
  });
}
```

### 安全检查清单

- [ ] 所有API包含user_id验证
- [ ] DTO参数验证
- [ ] 图片类型白名单
- [ ] 图片大小限制
- [ ] 内容长度限制
- [ ] 软删除实现
- [ ] 前端无v-html

---

## 11. 下一步行动 (Next Steps)

### 实施计划

```
Day 1          Day 2-3        Day 4-6        Day 7-8        Day 9-10
  │               │              │              │              │
  ▼               ▼              ▼              ▼              ▼
后端骨架  ───▶  后端API  ───▶  前端页面 ───▶  图表统计 ───▶  联调上线
```

### 任务清单

#### 阶段1：后端骨架（Day 1）
- [ ] 创建diary模块目录结构
- [ ] 定义Diary Entity
- [ ] 创建DTO类
- [ ] 注册DiaryModule
- [ ] 实现Controller骨架

#### 阶段2：后端API（Day 2-3）
- [ ] 实现日记CRUD Service
- [ ] 实现列表分页筛选
- [ ] 实现情绪统计API
- [ ] 完善错误处理

#### 阶段3：前端页面（Day 4-6）
- [ ] 创建前端目录结构
- [ ] 添加API函数
- [ ] 注册路由
- [ ] 实现日记主页面
- [ ] 实现日记列表
- [ ] 实现编辑弹窗

#### 阶段4：图表统计（Day 7-8）
- [ ] 实现情绪统计面板
- [ ] 实现情绪饼图
- [ ] 接入真实数据

#### 阶段5：联调上线（Day 9-10）
- [ ] 功能联调
- [ ] 回归测试
- [ ] Bug修复
- [ ] 部署上线

### 关键技术参考

| 参考项 | 参照模块 |
|-------|---------|
| 后端模块结构 | `src/photo_wall/` |
| 分页列表API | `finance_record.service.ts` |
| 统计API | `quiz_record.service.ts` |
| 前端页面结构 | `views/index-finance/Index.vue` |
| ECharts使用 | `views/Index.vue` |

### 成功标准

| 维度 | 标准 |
|------|------|
| **功能完整** | P0功能全部实现，流程无阻断 |
| **性能达标** | 列表加载<2s，创建<1s |
| **代码质量** | 符合编码规范，关键逻辑有注释 |
| **安全达标** | 数据隔离验证，输入验证完整 |
| **回归通过** | 现有功能不受影响 |

---

## 附录

### A. 开发启动Prompt

```markdown
请参考以下文档开始开发日记模块：

**架构文档：** docs/architecture-diary.md
**需求简报：** docs/brief-diary.md

第一步：创建后端骨架
1. 创建 backend/src/diary/ 目录
2. 创建 diary.entity.ts（参考 photo_wall.entity.ts）
3. 创建 diary.module.ts, diary.controller.ts, diary.service.ts
4. 创建 dto/ 目录和DTO文件
5. 在 app.module.ts 中注册 DiaryModule
6. 启动后端验证表自动创建

关键约束：
- 所有API必须验证user_id
- 响应格式统一为 { code, msg, data }
- 遵循现有代码风格
```

### B. 文档变更日志

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|---------|------|
| 2024-12-17 | v1.0 | 初始版本 | Winston |

---

*— End of Architecture Document —*

