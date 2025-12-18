# 个人中心数据自动刷新修复

> 📅 修复日期: 2024-12-17  
> 👤 开发者: James (Dev Agent)  
> 🐛 问题: 写日记和做题之后，个人中心的数据没有更新

---

## 问题描述

用户反馈：写日记和做题之后，个人中心的数据没有更新。

**问题原因**：
- 个人中心页面只在 `onMounted` 时加载数据
- 当用户从其他页面（日记、学习）返回个人中心时，数据不会自动刷新
- 写日记和做题后，个人中心的数据仍然是旧的

---

## 解决方案

### 1. 添加页面激活钩子 (`onActivated`)

当页面被激活时（从其他页面返回时）自动刷新数据：

```javascript
// 页面激活时刷新数据（从其他页面返回时）
onActivated(() => {
  const now = Date.now()
  // 如果距离上次刷新超过5秒，或者数据为空，则刷新
  if (now - lastRefreshTime.value > REFRESH_INTERVAL || !overview.value || Object.keys(overview.value).length === 0) {
    loadHomeData()
  }
})
```

### 2. 添加路由监听 (`watch`)

监听路由变化，当从其他页面导航到个人中心时刷新数据：

```javascript
// 监听路由变化，从其他页面返回时刷新
watch(() => route.path, (newPath, oldPath) => {
  // 如果从其他页面导航到个人中心，刷新数据
  if (newPath === '/' && oldPath && oldPath !== '/') {
    const now = Date.now()
    if (now - lastRefreshTime.value > REFRESH_INTERVAL) {
      loadHomeData()
    }
  }
})
```

### 3. 添加防抖机制

避免频繁刷新，5秒内不重复刷新：

```javascript
// 上次刷新时间，用于避免频繁刷新
const lastRefreshTime = ref(0)
const REFRESH_INTERVAL = 5000 // 5秒内不重复刷新

// 在 loadHomeData 成功后更新刷新时间
lastRefreshTime.value = Date.now()
```

---

## 修改文件

### `frontend/src/views/home/Index.vue`

**修改内容**：
1. 添加 `onActivated` 和 `watch` 导入
2. 添加 `lastRefreshTime` 和 `REFRESH_INTERVAL` 常量
3. 添加 `onActivated` 钩子
4. 添加路由 `watch` 监听
5. 在 `loadHomeData` 成功后更新 `lastRefreshTime`

---

## 工作原理

### 场景 1: 从其他页面返回个人中心

1. 用户写日记或做题
2. 点击导航栏返回个人中心
3. 路由变化触发 `watch`，检测到从其他页面导航到 `/`
4. 如果距离上次刷新超过5秒，自动刷新数据

### 场景 2: 页面被激活（keep-alive 场景）

1. 如果使用了 `keep-alive`，页面不会被销毁
2. 从其他页面返回时，`onActivated` 钩子触发
3. 如果距离上次刷新超过5秒或数据为空，自动刷新数据

### 场景 3: 首次加载

1. `onMounted` 钩子触发
2. 加载数据
3. 更新 `lastRefreshTime`

---

## 测试验证

### 测试步骤

1. **写日记后刷新**
   - 访问个人中心，记录当前数据
   - 写一篇新日记
   - 返回个人中心
   - ✅ 验证：数据已更新，显示新的日记统计和最近动态

2. **做题后刷新**
   - 访问个人中心，记录当前数据
   - 做几道题
   - 返回个人中心
   - ✅ 验证：数据已更新，显示新的学习统计和最近动态

3. **防抖测试**
   - 快速在个人中心和其他页面之间切换
   - ✅ 验证：5秒内不会重复刷新，避免频繁请求

---

## 注意事项

1. **刷新间隔**：当前设置为5秒，可以根据实际需求调整
2. **性能优化**：防抖机制避免频繁请求，提升性能
3. **用户体验**：自动刷新确保数据实时性，无需手动刷新

---

## 后续优化建议

1. **事件总线**：如果需要在写日记/做题成功后立即刷新个人中心（不等待返回），可以使用事件总线
2. **WebSocket**：如果需要实时更新，可以考虑使用 WebSocket
3. **缓存策略**：可以添加数据缓存，减少不必要的请求

---

*— End of Document —*

*— James | Full Stack Developer —*

