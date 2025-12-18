# 数据库迁移脚本

## add-user-id-to-records.js

为现有的财务记录和照片墙记录添加 `user_id` 字段。

### 功能

1. 检查 `finance_record` 和 `photo_wall` 表是否有 `user_id` 字段
2. 如果没有，自动添加 `user_id` 字段
3. 为所有现有记录分配 `user_id`（默认分配给第一个用户）

### 使用方法

```bash
# 方式1：使用 npm 脚本
cd backend
npm run migrate:add-user-id

# 方式2：直接运行
cd backend
node scripts/add-user-id-to-records.js
```

### 配置

脚本会从以下位置读取数据库配置（按优先级）：

1. 环境变量：`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
2. 默认值（从 `app.module.ts` 中获取）：
   - host: `localhost`
   - port: `3306`
   - user: `root`
   - password: `tang6688`
   - database: `madai`

### 注意事项

⚠️ **重要提示**：

1. **备份数据库**：运行脚本前请先备份数据库
2. **默认分配**：脚本会将所有现有记录分配给第一个用户（id=1）
3. **多用户场景**：如果有多个用户，需要根据业务需求手动调整分配逻辑
4. **TypeORM 同步**：如果 `synchronize: true`，TypeORM 会自动添加字段，但不会更新现有记录的 `user_id`

### 执行流程

1. 连接数据库
2. 检查表结构，如果缺少 `user_id` 字段则添加
3. 查找 `user_id` 为 NULL 或 0 的记录
4. 获取第一个用户 ID（如果存在）
5. 更新所有需要更新的记录
6. 显示统计信息

### 示例输出

```
🔌 正在连接数据库...
✅ 数据库连接成功

📋 检查表结构...
⚠️  finance_record 表缺少 user_id 字段，正在添加...
✅ finance_record 表已添加 user_id 字段

✅ photo_wall 表已有 user_id 字段

🔍 检查需要更新的记录...
📊 发现 15 条财务记录需要更新 user_id
📊 发现 8 条照片墙记录需要更新 user_id

👤 将使用用户 ID: 1

🔄 正在更新财务记录...
✅ 已更新 15 条财务记录的 user_id

🔄 正在更新照片墙记录...
✅ 已更新 8 条照片墙记录的 user_id

✨ 迁移完成！

📊 验证结果：
财务记录统计:
  - 总记录数: 15
  - 关联用户数: 1
  - 最小 user_id: 1
  - 最大 user_id: 1

照片墙记录统计:
  - 总记录数: 8
  - 关联用户数: 1
  - 最小 user_id: 1
  - 最大 user_id: 1

🔌 数据库连接已关闭
```

### 自定义分配逻辑

如果需要将记录分配给不同的用户，可以修改脚本中的分配逻辑。例如：

```javascript
// 根据创建时间或其他条件分配用户
// 这里只是示例，需要根据实际业务逻辑修改
const [records] = await connection.query(`
  SELECT id, created_at FROM finance_record 
  WHERE user_id IS NULL OR user_id = 0
`);

for (const record of records) {
  // 根据业务逻辑确定 user_id
  const userId = determineUserId(record);
  await connection.query(`
    UPDATE finance_record SET user_id = ? WHERE id = ?
  `, [userId, record.id]);
}
```

