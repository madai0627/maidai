# Dashboard API 404 错误处理方案
## 后端 API 未实现的临时处理

> 📅 创建日期: 2024-12-17  
> 👤 处理人: Quinn (QA Agent)  
> 🎯 问题: Dashboard API 返回 404（后端未实现）  
> 📊 状态: ✅ 已处理

---

## 1. 问题描述

### 1.1 问题现象

访问个人中心首页时，控制台出现 404 错误：
```
GET http://localhost:5173/api/dashboard/overview?userId=4 404 (Not Found)
GET http://localhost:5173/api/dashboard/activities?userId=4&limit=10 404 (Not Found)
```

### 1.2 问题原因

根据 PRD 文档（FR-007），Dashboard API 需要后端开发，但后端服务尚未实现这些接口：
- `GET /api/dashboard/overview` - 获取首页概览数据
- `GET /api/dashboard/activities` - 获取最近动态

### 1.3 影响范围

- **功能影响：** 首页无法显示真实数据，但可以显示默认值/空状态
- **用户体验：** 控制台有错误日志，但页面可以正常使用
- **严重程度：** 🟡 中等（不影响核心功能）

---

## 2. 解决方案

### 2.1 优雅降级处理 ✅

**方案：** 在 API 返回 404 时，静默处理，使用默认值，不显示错误提示

**实现：**
1. 检测 404 错误（`err.response?.status === 404`）
2. 如果是 404，静默处理，不显示错误提示
3. 使用默认值（空对象、空数组）
4. 组件会显示默认值或空状态

**优点：**
- 用户体验好，不会看到错误提示
- 页面可以正常使用
- 后端 API 实现后，自动切换为真实数据

### 2.2 代码修改

**文件：** `frontend/src/views/home/Index.vue`

**修改内容：**
```javascript
// 在 catch 中检测 404 错误
.catch(err => {
  // 如果是 404 错误（后端 API 未实现），静默处理
  if (err.response?.status === 404) {
    console.warn('Dashboard API 未实现，使用默认值')
    return null
  }
  console.error('加载概览数据失败:', err)
  return null
})
```

**效果：**
- 404 错误不会显示错误提示
- 页面显示默认值或空状态
- 用户体验良好

---

## 3. 当前状态

### 3.1 前端处理 ✅

- ✅ 已实现优雅降级处理
- ✅ 404 错误静默处理
- ✅ 使用默认值显示
- ✅ 不显示错误提示

### 3.2 后端状态 ⚠️

- ⚠️ Dashboard API 尚未实现
- ⚠️ 需要后端开发（FR-007）

---

## 4. 临时方案

### 4.1 当前行为

**404 错误时：**
- 概览数据：使用空对象 `{}`，组件显示默认值（0、未记录等）
- 最近动态：使用空数组 `[]`，组件显示空状态提示

**用户体验：**
- ✅ 页面正常显示
- ✅ 不显示错误提示
- ✅ 快速操作卡片正常（显示默认值）
- ✅ 本周概览正常（显示 0 值）
- ✅ 最近动态显示空状态提示

### 4.2 预期行为（后端 API 实现后）

**API 正常时：**
- 概览数据：显示真实数据
- 最近动态：显示真实活动记录

**自动切换：**
- 无需修改前端代码
- 后端 API 实现后，自动使用真实数据

---

## 5. 后端开发建议

### 5.1 API 接口规范

#### 5.1.1 获取首页概览数据

**接口：** `GET /api/dashboard/overview`

**参数：**
- `userId` (number, required) - 用户ID

**响应格式：**
```json
{
  "code": 0,
  "data": {
    "diary": {
      "todayMood": "开心",
      "weekCount": 5,
      "streak": 3
    },
    "photos": {
      "total": 56,
      "weekAdded": 3
    },
    "finance": {
      "monthExpense": 2345.00,
      "weekRecords": 12,
      "weekExpense": 856.00
    },
    "study": {
      "todayCount": 15,
      "weekCount": 30,
      "weekAccuracy": "85%"
    }
  }
}
```

#### 5.1.2 获取最近动态

**接口：** `GET /api/dashboard/activities`

**参数：**
- `userId` (number, required) - 用户ID
- `limit` (number, optional, default: 10) - 限制数量

**响应格式：**
```json
{
  "code": 0,
  "data": [
    {
      "id": "1",
      "type": "diary",
      "time": "12-17 15:30",
      "title": "写了日记「今天很开心」",
      "actionText": "查看",
      "actionUrl": "/diary/1"
    },
    {
      "id": "2",
      "type": "finance",
      "time": "12-17 12:20",
      "title": "记账 -88元 [午餐]",
      "actionText": "详情",
      "actionUrl": "/finance/2"
    }
  ]
}
```

### 5.2 开发优先级

**优先级：** P1（应该完成）

**工作量：** 4 小时（后端）

**依赖：** 无

---

## 6. 测试建议

### 6.1 当前测试

- ✅ 404 错误不显示错误提示
- ✅ 页面正常显示默认值
- ✅ 用户体验良好

### 6.2 后端 API 实现后测试

- [ ] API 返回正确数据格式
- [ ] 首页显示真实数据
- [ ] 数据更新正常
- [ ] 错误处理正常（非 404 错误）

---

## 7. 总结

### 7.1 处理结果

**✅ 问题已处理**

- 前端已实现优雅降级
- 404 错误静默处理
- 用户体验良好
- 等待后端 API 实现

### 7.2 后续行动

1. **后端开发**（P1）
   - 实现 Dashboard API
   - 测试 API 功能
   - 部署到生产环境

2. **前端验证**（P1）
   - 后端 API 实现后，验证数据正常显示
   - 测试错误处理

---

*— End of Document —*

*— Quinn | Test Architect & Quality Advisor —*

