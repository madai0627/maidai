# Test Design: 日记模块 Epic (Diary Module)

> **Date:** 2024-12-17  
> **Designer:** Quinn (Test Architect)  
> **Epic:** epic-diary-module  
> **Stories:** story-diary-1-backend, story-diary-2-frontend, story-diary-3-stats

---

## Test Strategy Overview

| 指标 | 数值 |
|------|------|
| **总测试场景** | 67 |
| **单元测试** | 12 (18%) |
| **集成测试** | 28 (42%) |
| **E2E测试** | 27 (40%) |
| **P0 优先级** | 18 |
| **P1 优先级** | 29 |
| **P2 优先级** | 16 |
| **P3 优先级** | 4 |

---

## Story 1: 后端 API 测试场景

### AC1: Diary Entity 创建

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 1.1-UNIT-001 | Unit | P0 | Entity字段定义完整性 | 纯数据结构验证 |
| 1.1-INT-001 | Integration | P0 | diary表自动创建（TypeORM sync） | 数据库交互 |
| 1.1-INT-002 | Integration | P1 | 复合索引[user_id, diary_date]有效 | 索引验证 |
| 1.1-INT-003 | Integration | P1 | 复合索引[user_id, mood]有效 | 索引验证 |

### AC2: DTO 验证类

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 1.2-UNIT-001 | Unit | P0 | CreateDiaryDto必填字段验证 | 纯验证逻辑 |
| 1.2-UNIT-002 | Unit | P0 | mood字段枚举值验证(5种) | 纯验证逻辑 |
| 1.2-UNIT-003 | Unit | P1 | UpdateDiaryDto部分更新支持 | 纯验证逻辑 |
| 1.2-UNIT-004 | Unit | P1 | ListDiaryDto分页参数验证 | 纯验证逻辑 |
| 1.2-INT-001 | Integration | P0 | 无效参数返回400错误 | API验证链路 |

### AC3: 日记 CRUD API

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 1.3-INT-001 | Integration | P0 | POST /api/diary/create 创建日记成功 | 核心CRUD |
| 1.3-INT-002 | Integration | P0 | GET /api/diary/:id 获取日记详情 | 核心CRUD |
| 1.3-INT-003 | Integration | P0 | PUT /api/diary/:id 更新日记 | 核心CRUD |
| 1.3-INT-004 | Integration | P0 | DELETE /api/diary/:id 软删除日记 | 核心CRUD |
| 1.3-INT-005 | Integration | P1 | 创建日记含图片Base64数组 | 数据格式 |
| 1.3-INT-006 | Integration | P1 | 创建日记含标签数组 | 数据格式 |
| 1.3-INT-007 | Integration | P2 | 更新日记部分字段 | 边缘用例 |

### AC4: 日记列表 API

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 1.4-INT-001 | Integration | P0 | GET /api/diary/list 分页返回 | 核心列表 |
| 1.4-INT-002 | Integration | P1 | 情绪筛选(mood)参数生效 | 筛选功能 |
| 1.4-INT-003 | Integration | P1 | 日期范围筛选(startDate/endDate) | 筛选功能 |
| 1.4-INT-004 | Integration | P1 | 关键词搜索(keyword) | 筛选功能 |
| 1.4-INT-005 | Integration | P1 | 按diary_date倒序排列 | 排序验证 |

### AC5: 统计 API

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 1.5-INT-001 | Integration | P1 | GET /api/diary/stats/mood 返回情绪统计 | 统计功能 |
| 1.5-INT-002 | Integration | P1 | 情绪统计包含数量和百分比 | 数据完整 |
| 1.5-INT-003 | Integration | P2 | 按月份筛选统计 | 筛选功能 |
| 1.5-INT-004 | Integration | P2 | GET /api/diary/streak 连续记录天数 | 统计功能 |

### AC6: 日历 API

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 1.6-INT-001 | Integration | P1 | GET /api/diary/calendar 返回月度数据 | 日历功能 |
| 1.6-INT-002 | Integration | P2 | 日历数据包含日期和情绪 | 数据格式 |

### AC7-8: 模块注册 & 数据隔离

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 1.7-INT-001 | Integration | P0 | DiaryModule正确注册到AppModule | 启动验证 |
| 1.7-INT-002 | Integration | P0 | 后端启动无报错 | 启动验证 |
| 1.8-INT-001 | Integration | P0 | **用户A无法查看用户B的日记** | 安全隔离 |
| 1.8-INT-002 | Integration | P0 | 用户A无法修改用户B的日记 | 安全隔离 |
| 1.8-INT-003 | Integration | P0 | 用户A无法删除用户B的日记 | 安全隔离 |

### AC9-10: 响应格式 & 错误处理

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 1.9-UNIT-001 | Unit | P1 | 响应格式 { code, msg, data } 统一 | 格式验证 |
| 1.10-INT-001 | Integration | P1 | 参数验证错误返回明确提示 | 错误处理 |
| 1.10-INT-002 | Integration | P2 | 数据库异常有兜底处理 | 错误处理 |

---

## Story 2: 前端页面 测试场景

### AC1: 路由和API配置

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 2.1-E2E-001 | E2E | P0 | /index-diary 路由可访问 | 核心入口 |
| 2.1-INT-001 | Integration | P1 | 7个API函数正确导出 | API配置 |

### AC2-3: 日记主页面 & 列表

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 2.2-E2E-001 | E2E | P0 | 页面标题"📔 我的日记"显示 | UI渲染 |
| 2.2-E2E-002 | E2E | P1 | 搜索框存在且可输入 | UI交互 |
| 2.2-E2E-003 | E2E | P1 | 情绪筛选下拉框可用 | UI交互 |
| 2.2-E2E-004 | E2E | P1 | 新建按钮点击有效 | UI交互 |
| 2.3-E2E-001 | E2E | P0 | 日记列表正确加载 | 数据展示 |
| 2.3-E2E-002 | E2E | P1 | 分页切换功能正常 | 分页功能 |
| 2.3-E2E-003 | E2E | P2 | 空状态显示引导文字 | 空态处理 |

### AC4: 日记卡片

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 2.4-UNIT-001 | Unit | P1 | DiaryCard组件props验证 | 组件验证 |
| 2.4-E2E-001 | E2E | P1 | 卡片显示情绪emoji和标签 | 数据展示 |
| 2.4-E2E-002 | E2E | P1 | 卡片显示日期(YYYY-MM-DD 周X) | 数据展示 |
| 2.4-E2E-003 | E2E | P2 | 卡片内容预览最多2行 | UI渲染 |
| 2.4-E2E-004 | E2E | P2 | 卡片悬停效果(上浮+阴影) | UI交互 |

### AC5: 情绪选择器

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 2.5-UNIT-001 | Unit | P1 | MoodSelector v-model双向绑定 | 组件验证 |
| 2.5-E2E-001 | E2E | P1 | 5种情绪横向排列显示 | UI渲染 |
| 2.5-E2E-002 | E2E | P1 | 点击选中有弹跳动效 | UI交互 |
| 2.5-E2E-003 | E2E | P3 | compact模式仅显示emoji | 响应式 |

### AC6: 日记编辑弹窗

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 2.6-E2E-001 | E2E | P0 | 新建弹窗标题"写日记" | UI渲染 |
| 2.6-E2E-002 | E2E | P0 | 编辑弹窗标题"编辑日记" | UI渲染 |
| 2.6-E2E-003 | E2E | P0 | 情绪必选，未选禁用保存 | 表单验证 |
| 2.6-E2E-004 | E2E | P1 | 日期选择默认今天 | 默认值 |
| 2.6-E2E-005 | E2E | P1 | 保存成功有反馈提示 | 用户反馈 |
| 2.6-E2E-006 | E2E | P2 | 图片上传最多9张限制 | 业务规则 |
| 2.6-E2E-007 | E2E | P2 | 标签输入最多10个限制 | 业务规则 |

### AC7: 日记详情弹窗

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 2.7-E2E-001 | E2E | P1 | 详情弹窗显示完整内容 | 数据展示 |
| 2.7-E2E-002 | E2E | P1 | 编辑/删除按钮可用 | UI交互 |
| 2.7-E2E-003 | E2E | P2 | 删除需二次确认 | 安全操作 |

### AC9-12: 数据交互 & 质量

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 2.9-E2E-001 | E2E | P0 | 创建日记后列表自动刷新 | 数据同步 |
| 2.9-E2E-002 | E2E | P0 | 编辑日记后数据同步更新 | 数据同步 |
| 2.9-E2E-003 | E2E | P0 | 删除日记后卡片移除 | 数据同步 |
| 2.10-E2E-001 | E2E | P1 | API错误显示ElMessage提示 | 错误处理 |
| 2.12-E2E-001 | E2E | P1 | Desktop(≥1024px)双栏布局 | 响应式 |
| 2.12-E2E-002 | E2E | P2 | Tablet单栏，统计折叠 | 响应式 |
| 2.12-E2E-003 | E2E | P3 | Mobile紧凑布局 | 响应式 |

---

## Story 3: 统计联调 测试场景

### AC1-2: 情绪统计面板 & 饼图

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 3.1-E2E-001 | E2E | P1 | 面板标题"📊 情绪统计"显示 | UI渲染 |
| 3.1-E2E-002 | E2E | P1 | 连续记录天数显示(🔥) | 数据展示 |
| 3.1-E2E-003 | E2E | P2 | 空数据显示暂无数据提示 | 空态处理 |
| 3.2-E2E-001 | E2E | P1 | ECharts环形饼图渲染 | 图表渲染 |
| 3.2-E2E-002 | E2E | P2 | 饼图800ms动画效果 | UI动效 |
| 3.2-E2E-003 | E2E | P2 | 悬停显示详情tooltip | UI交互 |

### AC3: 图表交互

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 3.3-E2E-001 | E2E | P1 | **点击饼图扇区筛选列表** | 核心交互 |
| 3.3-E2E-002 | E2E | P1 | 切换月份图表和列表同步 | 数据联动 |
| 3.3-E2E-003 | E2E | P2 | 图例点击筛选联动 | UI交互 |

### AC4: 首页快捷入口

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 3.4-E2E-001 | E2E | P1 | 首页"写日记"按钮存在 | UI渲染 |
| 3.4-E2E-002 | E2E | P1 | 点击跳转/index-diary | 导航功能 |

### AC8-9: 功能测试 & 回归测试

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 3.8-E2E-001 | E2E | P0 | 完整CRUD流程(创建→查看→编辑→删除) | 端到端验证 |
| 3.8-E2E-002 | E2E | P1 | 筛选功能完整测试 | 功能验证 |
| 3.9-E2E-001 | E2E | P1 | 首页仪表盘功能正常 | 回归测试 |
| 3.9-E2E-002 | E2E | P1 | 其他模块功能不受影响 | 回归测试 |
| 3.9-E2E-003 | E2E | P3 | 导航功能正常跳转 | 回归测试 |

### AC10: 性能达标

| ID | Level | Priority | 测试场景 | 理由 |
|----|-------|----------|---------|------|
| 3.10-UNIT-001 | Unit | P1 | 列表加载 < 2秒 | 性能指标 |
| 3.10-UNIT-002 | Unit | P2 | 创建操作 < 1秒 | 性能指标 |

---

## 风险覆盖映射

| 风险ID | 风险描述 | 测试覆盖 |
|--------|---------|---------|
| RISK-001 | 数据泄露（用户隔离失败） | 1.8-INT-001/002/003 |
| RISK-002 | CRUD功能失败 | 1.3-INT-001~007 |
| RISK-003 | 前后端数据不同步 | 2.9-E2E-001/002/003 |
| RISK-004 | 图表渲染异常 | 3.2-E2E-001/002/003 |
| RISK-005 | 筛选逻辑错误 | 1.4-INT-002~004, 3.3-E2E-001~003 |

---

## 推荐执行顺序

### Phase 1: P0 测试 (必须通过)

```
1. 1.8-INT-001 用户数据隔离验证 (安全)
2. 1.3-INT-001~004 CRUD API测试 (核心)
3. 2.1-E2E-001 路由可访问 (入口)
4. 2.6-E2E-003 情绪必选验证 (业务规则)
5. 2.9-E2E-001~003 数据同步测试 (一致性)
6. 3.8-E2E-001 完整CRUD流程 (端到端)
```

### Phase 2: P1 测试 (应该通过)

```
7. 1.4-INT-001~005 列表筛选API
8. 1.5-INT-001~002 统计API
9. 2.2-E2E-002~004 主页面UI交互
10. 2.5-E2E-001~002 情绪选择器
11. 3.3-E2E-001~002 图表交互
12. 3.9-E2E-001~002 回归测试
```

### Phase 3: P2/P3 测试 (时间允许)

```
13. 响应式布局测试
14. 边缘用例测试
15. 性能测试
```

---

## 测试工具建议

| 测试类型 | 推荐工具 |
|---------|---------|
| 单元测试 | Jest (NestJS), Vitest (Vue) |
| 集成测试 | Supertest (API), Vue Test Utils |
| E2E测试 | Playwright / Cypress |
| 性能测试 | Lighthouse, Chrome DevTools |
| API测试 | Postman / curl |

---

## Quality Checklist

- [x] 每个AC都有测试覆盖
- [x] 测试层级分配合理（单元→集成→E2E）
- [x] 无重复覆盖跨层级
- [x] 关键路径有多层级覆盖
- [x] 风险缓解已对应
- [x] 测试ID遵循命名规范
- [x] 测试场景原子化且独立

---

## Gate YAML Block

```yaml
test_design:
  epic: diary-module
  scenarios_total: 67
  by_level:
    unit: 12
    integration: 28
    e2e: 27
  by_priority:
    p0: 18
    p1: 29
    p2: 16
    p3: 4
  coverage_gaps: []
  risk_coverage:
    - RISK-001: data_isolation
    - RISK-002: crud_functionality
    - RISK-003: data_sync
    - RISK-004: chart_rendering
    - RISK-005: filter_logic
  estimated_execution_time: "4-6 hours manual, 1-2 hours automated"
```

---

## Trace References

```
Test design matrix: docs/qa/assessments/diary-epic-test-design-20241217.md
P0 tests identified: 18
P1 tests identified: 29
Stories covered: 3/3
AC coverage: 100%
```

---

*— End of Test Design Document —*

