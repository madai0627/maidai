# Dashboard 学习数据不更新问题修复

## 问题描述

用户做完题后回到个人中心，当天数据和本周数据还是0，最近动态里也没有，手动刷新后还是这样。

## 问题分析

### 可能原因

1. **数据库字段命名不一致**
   - `QuizRecord` 实体使用驼峰命名（`userId`, `createdAt`）
   - 其他实体（`Diary`, `FinanceRecord`）使用下划线命名（`user_id`, `created_at`）
   - TypeORM 默认将驼峰命名转换为下划线命名，但查询时需要使用实体属性名

2. **查询逻辑问题**
   - `getStudyOverview` 和 `getStudyActivities` 使用 `createQueryBuilder` 时，应该使用实体属性名
   - 如果数据库字段是下划线命名，TypeORM 会自动转换

3. **userId 不匹配**
   - 前端传递的 `userId` 可能与数据库中的 `userId` 不匹配

## 修复方案

### 1. 添加调试日志

已在 `getStudyOverview` 和 `getStudyActivities` 方法中添加调试日志，用于排查问题。

### 2. 验证查询逻辑

检查 `QuizRecord` 实体的实际数据库字段名：
- 如果数据库字段是 `user_id` 和 `created_at`，需要修改查询逻辑
- 如果数据库字段是 `userId` 和 `createdAt`，当前查询逻辑应该正确

### 3. 测试步骤

1. 重启后端服务
2. 做几道题
3. 查看后端控制台的调试日志
4. 检查返回的数据是否正确

## 下一步

如果调试日志显示查询结果为0，可能需要：
1. 检查数据库表结构，确认字段名
2. 修改查询逻辑，使用正确的字段名
3. 验证 `userId` 是否正确传递

