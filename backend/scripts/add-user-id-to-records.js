/**
 * 数据库迁移脚本：为现有的财务记录和照片墙记录添加 user_id
 * 
 * 使用方法：
 * 1. 确保数据库连接配置正确
 * 2. 运行: node scripts/add-user-id-to-records.js
 * 
 * 注意：
 * - 脚本会将所有现有记录分配给第一个用户（id=1）
 * - 如果有多个用户，可以根据业务需求修改分配逻辑
 */

const mysql = require('mysql2/promise');

// 数据库配置（从 app.module.ts 中的配置）
// 注意：如果使用环境变量，请修改这里的配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'tang6688',
  database: process.env.DB_NAME || 'madai',
};

// 默认分配给第一个用户（可以根据需要修改）
const DEFAULT_USER_ID = 1;

async function main() {
  let connection;
  
  try {
    console.log('🔌 正在连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    // 检查 user_id 字段是否存在
    console.log('📋 检查表结构...');
    
    // 检查 finance_record 表
    const [financeColumns] = await connection.query(`
      SHOW COLUMNS FROM finance_record LIKE 'user_id'
    `);
    
    if (financeColumns.length === 0) {
      console.log('⚠️  finance_record 表缺少 user_id 字段，正在添加...');
      await connection.query(`
        ALTER TABLE finance_record 
        ADD COLUMN user_id INT NOT NULL DEFAULT ${DEFAULT_USER_ID} AFTER id
      `);
      console.log('✅ finance_record 表已添加 user_id 字段\n');
    } else {
      console.log('✅ finance_record 表已有 user_id 字段');
      // 检查字段是否允许 NULL，如果允许则修改为 NOT NULL
      const columnInfo = financeColumns[0];
      if (columnInfo.Null === 'YES') {
        console.log('⚠️  user_id 字段允许 NULL，正在修改为 NOT NULL...');
        // 先更新所有 NULL 值
        await connection.query(`
          UPDATE finance_record 
          SET user_id = ${DEFAULT_USER_ID} 
          WHERE user_id IS NULL
        `);
        // 然后修改字段为 NOT NULL
        await connection.query(`
          ALTER TABLE finance_record 
          MODIFY COLUMN user_id INT NOT NULL DEFAULT ${DEFAULT_USER_ID}
        `);
        console.log('✅ user_id 字段已修改为 NOT NULL\n');
      } else {
        console.log('✅ user_id 字段已设置为 NOT NULL\n');
      }
    }

    // 检查 photo_wall 表
    const [photoColumns] = await connection.query(`
      SHOW COLUMNS FROM photo_wall LIKE 'user_id'
    `);
    
    if (photoColumns.length === 0) {
      console.log('⚠️  photo_wall 表缺少 user_id 字段，正在添加...');
      await connection.query(`
        ALTER TABLE photo_wall 
        ADD COLUMN user_id INT NOT NULL DEFAULT ${DEFAULT_USER_ID} AFTER id
      `);
      console.log('✅ photo_wall 表已添加 user_id 字段\n');
    } else {
      console.log('✅ photo_wall 表已有 user_id 字段');
      // 检查字段是否允许 NULL，如果允许则修改为 NOT NULL
      const columnInfo = photoColumns[0];
      if (columnInfo.Null === 'YES') {
        console.log('⚠️  user_id 字段允许 NULL，正在修改为 NOT NULL...');
        // 先更新所有 NULL 值
        await connection.query(`
          UPDATE photo_wall 
          SET user_id = ${DEFAULT_USER_ID} 
          WHERE user_id IS NULL
        `);
        // 然后修改字段为 NOT NULL
        await connection.query(`
          ALTER TABLE photo_wall 
          MODIFY COLUMN user_id INT NOT NULL DEFAULT ${DEFAULT_USER_ID}
        `);
        console.log('✅ user_id 字段已修改为 NOT NULL\n');
      } else {
        console.log('✅ user_id 字段已设置为 NOT NULL\n');
      }
    }

    // 检查是否有 user_id 为 NULL 或 0 的记录
    console.log('🔍 检查需要更新的记录...');
    
    const [financeNullRecords] = await connection.query(`
      SELECT COUNT(*) as count FROM finance_record 
      WHERE user_id IS NULL OR user_id = 0
    `);
    
    const [photoNullRecords] = await connection.query(`
      SELECT COUNT(*) as count FROM photo_wall 
      WHERE user_id IS NULL OR user_id = 0
    `);

    const financeCount = financeNullRecords[0].count;
    const photoCount = photoNullRecords[0].count;

    console.log(`📊 发现 ${financeCount} 条财务记录需要更新 user_id`);
    console.log(`📊 发现 ${photoCount} 条照片墙记录需要更新 user_id\n`);

    if (financeCount > 0 || photoCount > 0) {
      // 获取第一个用户 ID（如果存在）
      const [users] = await connection.query(`
        SELECT id FROM users ORDER BY id ASC LIMIT 1
      `);

      let targetUserId = DEFAULT_USER_ID;
      if (users.length > 0) {
        targetUserId = users[0].id;
        console.log(`👤 将使用用户 ID: ${targetUserId}\n`);
      } else {
        console.log(`⚠️  未找到用户，将使用默认用户 ID: ${targetUserId}\n`);
      }

      // 更新财务记录
      if (financeCount > 0) {
        console.log('🔄 正在更新财务记录...');
        const [result] = await connection.query(`
          UPDATE finance_record 
          SET user_id = ? 
          WHERE user_id IS NULL OR user_id = 0
        `, [targetUserId]);
        console.log(`✅ 已更新 ${result.affectedRows} 条财务记录的 user_id\n`);
      }

      // 更新照片墙记录
      if (photoCount > 0) {
        console.log('🔄 正在更新照片墙记录...');
        const [result] = await connection.query(`
          UPDATE photo_wall 
          SET user_id = ? 
          WHERE user_id IS NULL OR user_id = 0
        `, [targetUserId]);
        console.log(`✅ 已更新 ${result.affectedRows} 条照片墙记录的 user_id\n`);
      }

      console.log('✨ 迁移完成！');
    } else {
      console.log('✨ 所有记录都已有关联的 user_id，无需更新');
    }

    // 验证结果
    console.log('\n📊 验证结果：');
    const [financeStats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT user_id) as user_count,
        MIN(user_id) as min_user_id,
        MAX(user_id) as max_user_id
      FROM finance_record
    `);
    
    const [photoStats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT user_id) as user_count,
        MIN(user_id) as min_user_id,
        MAX(user_id) as max_user_id
      FROM photo_wall
    `);

    console.log('财务记录统计:');
    console.log(`  - 总记录数: ${financeStats[0].total}`);
    console.log(`  - 关联用户数: ${financeStats[0].user_count}`);
    console.log(`  - 最小 user_id: ${financeStats[0].min_user_id}`);
    console.log(`  - 最大 user_id: ${financeStats[0].max_user_id}`);

    console.log('\n照片墙记录统计:');
    console.log(`  - 总记录数: ${photoStats[0].total}`);
    console.log(`  - 关联用户数: ${photoStats[0].user_count}`);
    console.log(`  - 最小 user_id: ${photoStats[0].min_user_id}`);
    console.log(`  - 最大 user_id: ${photoStats[0].max_user_id}`);

  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 运行脚本
main().catch((error) => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});

