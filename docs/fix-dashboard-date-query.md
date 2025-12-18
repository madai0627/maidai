# Dashboard API 日期查询修复

> 📅 修复日期: 2024-12-17  
> 👤 开发者: James (Dev Agent)  
> 🐛 问题: 写日记和做题后，个人中心数据没有更新（即使手动刷新）

---

## 问题分析

### 根本原因

**日期类型不匹配导致的查询失败**：

1. **日记日期查询问题**：
   - `diary_date` 字段是 MySQL `date` 类型（只有日期，没有时间）
   - 原查询使用 `Between(today, todayEnd)`，其中 `today` 和 `todayEnd` 是包含时间的 `Date` 对象
   - MySQL 在比较 `date` 和 `datetime` 时可能不准确

2. **学习记录查询问题**：
   - `createdAt` 是 `datetime` 类型，但查询今日数据时只使用了 `MoreThanOrEqual(today)`
   - 没有设置结束时间，可能导致查询不准确

---

## 修复方案

### 1. 修复日记日期查询

**修改前**：
```typescript
const todayDiary = await this.diaryRepo.findOne({
  where: {
    user_id: userId,
    diary_date: Between(today, todayEnd), // ❌ date 类型字段使用 datetime 比较
    is_deleted: false,
  },
});
```

**修改后**：
```typescript
// 使用 DATE() 函数确保日期比较准确
const todayDiary = await this.diaryRepo
  .createQueryBuilder('diary')
  .where('diary.user_id = :userId', { userId })
  .andWhere('DATE(diary.diary_date) = DATE(:today)', { today: todayStr })
  .andWhere('diary.is_deleted = :isDeleted', { isDeleted: false })
  .orderBy('diary.created_at', 'DESC')
  .getOne();
```

### 2. 修复学习记录查询

**修改前**：
```typescript
const todayCount = await this.quizRecordRepo.count({
  where: {
    userId,
    createdAt: MoreThanOrEqual(today), // ❌ 没有结束时间
  },
});
```

**修改后**：
```typescript
const todayEnd = new Date(today);
todayEnd.setHours(23, 59, 59, 999);

const todayCount = await this.quizRecordRepo
  .createQueryBuilder('record')
  .where('record.userId = :userId', { userId })
  .andWhere('record.createdAt >= :today', { today })
  .andWhere('record.createdAt <= :todayEnd', { todayEnd })
  .getCount();
```

### 3. 添加日期格式化工具方法

```typescript
/**
 * 格式化日期为 YYYY-MM-DD 字符串
 */
private formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

---

## 修改文件

### `backend/src/dashboard/dashboard.service.ts`

**修改内容**：
1. 修复 `getDiaryOverview` 方法：
   - 使用 `QueryBuilder` 和 `DATE()` 函数进行日期比较
   - 确保 `date` 类型字段的查询准确性

2. 修复 `getStudyOverview` 方法：
   - 添加 `todayEnd` 时间范围
   - 使用 `QueryBuilder` 确保查询准确

3. 添加 `formatDateString` 工具方法：
   - 用于格式化日期为字符串，便于 MySQL 日期比较

4. 移除未使用的 `Between` 导入

---

## 测试验证

### 测试步骤

1. **写日记后验证**：
   - 写一篇新日记（选择今天日期）
   - 访问个人中心
   - ✅ 验证：今日情绪显示正确
   - ✅ 验证：本周日记数增加
   - ✅ 验证：最近动态显示新日记

2. **做题后验证**：
   - 做几道题
   - 访问个人中心
   - ✅ 验证：今日做题数显示正确
   - ✅ 验证：本周做题数增加
   - ✅ 验证：最近动态显示新答题记录

3. **手动刷新验证**：
   - 写日记/做题后，手动刷新个人中心页面
   - ✅ 验证：数据立即更新

---

## 技术细节

### MySQL 日期类型比较

- **`date` 类型**：只存储日期（YYYY-MM-DD），不包含时间
- **`datetime` 类型**：存储日期和时间（YYYY-MM-DD HH:mm:ss）

**问题**：
- 直接使用 `Date` 对象与 `date` 类型字段比较时，MySQL 会进行隐式转换
- 转换可能因时区、时间部分等因素导致不准确

**解决方案**：
- 使用 `DATE()` 函数显式提取日期部分进行比较
- 确保比较的双方都是纯日期，避免时间部分干扰

### 示例 SQL

**修复前（可能不准确）**：
```sql
SELECT * FROM diary 
WHERE diary_date BETWEEN '2024-12-17 00:00:00' AND '2024-12-17 23:59:59'
```

**修复后（准确）**：
```sql
SELECT * FROM diary 
WHERE DATE(diary_date) = DATE('2024-12-17')
```

---

## 注意事项

1. **时区问题**：确保服务器时区与数据库时区一致
2. **日期格式**：使用 `YYYY-MM-DD` 格式确保兼容性
3. **性能考虑**：`DATE()` 函数会阻止索引使用，但对于小数据量影响不大

---

## 后续优化建议

1. **索引优化**：如果数据量大，可以考虑添加函数索引
2. **缓存策略**：可以添加 Redis 缓存，减少数据库查询
3. **实时更新**：可以考虑使用 WebSocket 实现实时数据推送

---

*— End of Document —*

*— James | Full Stack Developer —*

