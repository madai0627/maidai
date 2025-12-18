# Dashboard API 开发文档
## 首页数据聚合 API 实现指南

> 📅 创建日期: 2024-12-17  
> 👤 开发者: Backend Team  
> 📊 版本: v1.0  
> 🎯 状态: 待实现  
> 📎 关联文档: 
> - [PRD FR-007](./prd-frontend-optimization.md#47-dashboard-api-开发-fr-007)
> - [前端 API 404 处理方案](./qa-api-404-handling.md)

---

## 1. 概述 (Overview)

### 1.1 需求背景

前端个人中心首页需要展示各模块的概览数据和最近动态，需要后端提供数据聚合 API。

### 1.2 功能目标

- **概览数据 API**：聚合日记、照片墙、财务、学习四个模块的统计数据
- **最近动态 API**：聚合各模块的最近活动，按时间倒序返回

### 1.3 技术栈

- **框架**: NestJS
- **ORM**: TypeORM
- **数据库**: MySQL (madai)
- **API 风格**: RESTful
- **响应格式**: `{ code: number, msg: string, data: any }`

---

## 2. 模块结构设计

### 2.1 目录结构

```
backend/src/
└── dashboard/
    ├── dashboard.controller.ts    # 控制器
    ├── dashboard.service.ts        # 业务逻辑
    ├── dashboard.module.ts         # 模块定义
    └── dto/
        ├── overview.dto.ts         # 概览数据 DTO
        └── activities.dto.ts        # 最近动态 DTO
```

### 2.2 模块依赖

Dashboard 模块需要依赖以下模块：
- `DiaryModule` - 日记数据
- `PhotoWallModule` - 照片墙数据
- `FinanceRecordModule` - 财务数据
- `QuizRecordModule` - 学习数据

---

## 3. API 接口规范

### 3.1 获取首页概览数据

#### 接口信息

- **路径**: `GET /api/dashboard/overview`
- **描述**: 获取各模块的概览统计数据
- **认证**: 需要用户登录（通过 userId 参数）

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | number | 是 | 用户ID |

#### 响应格式

**成功响应 (code: 0):**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "diary": {
      "todayMood": "happy",
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

**错误响应 (code: 非0):**

```json
{
  "code": 500,
  "msg": "查询失败: 具体错误信息",
  "data": null
}
```

#### 数据字段说明

**diary (日记模块):**
- `todayMood` (string | null): 今日情绪，如果今日未写日记则为 null
- `weekCount` (number): 本周日记篇数
- `streak` (number): 连续记录天数

**photos (照片墙模块):**
- `total` (number): 照片总数
- `weekAdded` (number): 本周新增照片数

**finance (财务模块):**
- `monthExpense` (number): 本月支出总额
- `weekRecords` (number): 本周记账笔数
- `weekExpense` (number): 本周支出总额

**study (学习模块):**
- `todayCount` (number): 今日做题数
- `weekCount` (number): 本周做题数
- `weekAccuracy` (string): 本周正确率，格式如 "85%"

---

### 3.2 获取最近动态

#### 接口信息

- **路径**: `GET /api/dashboard/activities`
- **描述**: 获取各模块的最近活动记录，按时间倒序
- **认证**: 需要用户登录（通过 userId 参数）

#### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| userId | number | 是 | - | 用户ID |
| limit | number | 否 | 10 | 限制返回数量 |

#### 响应格式

**成功响应 (code: 0):**

```json
{
  "code": 0,
  "msg": "success",
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
      "id": "101",
      "type": "finance",
      "time": "12-17 12:20",
      "title": "记账 -88元 [午餐]",
      "actionText": "详情",
      "actionUrl": "/finance/101"
    },
    {
      "id": null,
      "type": "photos",
      "time": "12-17 10:15",
      "title": "上传了3张照片",
      "actionText": "查看",
      "actionUrl": "/photos"
    },
    {
      "id": null,
      "type": "study",
      "time": "12-17 09:00",
      "title": "完成10道题，正确率90%",
      "actionText": "继续",
      "actionUrl": "/study"
    }
  ]
}
```

**错误响应 (code: 非0):**

```json
{
  "code": 500,
  "msg": "查询失败: 具体错误信息",
  "data": null
}
```

#### 数据字段说明

**活动项 (Activity):**
- `id` (string | null): 活动关联的实体ID，如果无关联则为 null
- `type` (string): 活动类型，可选值：`diary` | `photos` | `finance` | `study`
- `time` (string): 活动时间，格式：`MM-DD HH:mm`
- `title` (string): 活动标题描述
- `actionText` (string): 操作按钮文字，如 "查看"、"详情"、"继续"
- `actionUrl` (string): 操作跳转路径

---

## 4. 数据查询逻辑

### 4.1 概览数据查询

#### 4.1.1 日记模块数据

**今日情绪 (todayMood):**
```sql
SELECT mood FROM diary 
WHERE user_id = ? 
  AND DATE(diary_date) = CURDATE() 
  AND is_deleted = false 
ORDER BY created_at DESC 
LIMIT 1
```

**本周日记数 (weekCount):**
```sql
SELECT COUNT(*) FROM diary 
WHERE user_id = ? 
  AND diary_date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
  AND diary_date <= CURDATE()
  AND is_deleted = false
```

**连续记录天数 (streak):**
- 参考 `diary.service.ts` 中的 `getStreakDays` 方法
- 从今天往前查找连续有日记的日期

#### 4.1.2 照片墙模块数据

**照片总数 (total):**
```sql
SELECT COUNT(*) FROM photo_wall 
WHERE user_id = ? 
  AND is_deleted = false
```

**本周新增 (weekAdded):**
```sql
SELECT COUNT(*) FROM photo_wall 
WHERE user_id = ? 
  AND created_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
  AND created_at <= NOW()
  AND is_deleted = false
```

#### 4.1.3 财务模块数据

**本月支出 (monthExpense):**
```sql
SELECT SUM(CAST(amount AS DECIMAL(12,2))) FROM finance_record 
WHERE user_id = ? 
  AND YEAR(created_at) = YEAR(CURDATE())
  AND MONTH(created_at) = MONTH(CURDATE())
  AND type = 'expense'
```

**本周记账笔数 (weekRecords):**
```sql
SELECT COUNT(*) FROM finance_record 
WHERE user_id = ? 
  AND created_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
  AND created_at <= NOW()
```

**本周支出 (weekExpense):**
```sql
SELECT SUM(CAST(amount AS DECIMAL(12,2))) FROM finance_record 
WHERE user_id = ? 
  AND created_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
  AND created_at <= NOW()
  AND type = 'expense'
```

#### 4.1.4 学习模块数据

**今日做题数 (todayCount):**
```sql
SELECT COUNT(*) FROM quiz_record 
WHERE userId = ? 
  AND DATE(createdAt) = CURDATE()
```

**本周做题数 (weekCount):**
```sql
SELECT COUNT(*) FROM quiz_record 
WHERE userId = ? 
  AND createdAt >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
  AND createdAt <= NOW()
```

**本周正确率 (weekAccuracy):**
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) as correct
FROM quiz_record 
WHERE userId = ? 
  AND createdAt >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
  AND createdAt <= NOW()
```
计算：`(correct / total) * 100`，格式化为 "XX%"

---

### 4.2 最近动态查询

#### 4.2.1 数据聚合策略

需要从四个模块查询最近的活动记录，然后按时间倒序合并：

1. **日记活动**: 查询最近创建的日记
2. **照片活动**: 查询最近上传的照片（可能批量上传）
3. **财务活动**: 查询最近记账记录
4. **学习活动**: 查询最近答题记录（可能需要聚合为"完成N道题"）

#### 4.2.2 查询 SQL

**日记活动:**
```sql
SELECT 
  id,
  'diary' as type,
  DATE_FORMAT(created_at, '%m-%d %H:%i') as time,
  CONCAT('写了日记「', COALESCE(title, LEFT(content, 20)), '」') as title,
  '/diary/' as base_url
FROM diary 
WHERE user_id = ? 
  AND is_deleted = false 
ORDER BY created_at DESC 
LIMIT ?
```

**照片活动:**
```sql
SELECT 
  id,
  'photos' as type,
  DATE_FORMAT(created_at, '%m-%d %H:%i') as time,
  '上传了照片' as title,
  '/photos' as base_url
FROM photo_wall 
WHERE user_id = ? 
  AND is_deleted = false 
ORDER BY created_at DESC 
LIMIT ?
```

**财务活动:**
```sql
SELECT 
  id,
  'finance' as type,
  DATE_FORMAT(created_at, '%m-%d %H:%i') as time,
  CONCAT('记账 ', 
    CASE WHEN type = 'expense' THEN '-' ELSE '+' END,
    amount, '元 [', COALESCE(purpose, ''), ']') as title,
  '/finance' as base_url
FROM finance_record 
WHERE user_id = ? 
ORDER BY created_at DESC 
LIMIT ?
```

**学习活动:**
```sql
-- 按日期分组，聚合为"完成N道题，正确率XX%"
SELECT 
  DATE(createdAt) as date,
  COUNT(*) as count,
  SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) as correct,
  DATE_FORMAT(MAX(createdAt), '%m-%d %H:%i') as time
FROM quiz_record 
WHERE userId = ? 
GROUP BY DATE(createdAt)
ORDER BY date DESC 
LIMIT ?
```

#### 4.2.3 数据合并逻辑

1. 从四个模块查询数据
2. 统一格式化为活动项结构
3. 按时间倒序排序
4. 取前 `limit` 条

---

## 5. 快速开始

### 5.1 前置检查清单

在开始实现前，请先完成以下检查：

- [ ] 检查 `PhotoWall` 实体是否有 `user_id` 字段
- [ ] 检查 `PhotoWall` 实体是否有 `is_deleted` 字段
- [ ] 检查 `FinanceRecord` 实体是否有 `user_id` 字段
- [ ] 检查 `FinanceRecord` 实体是否有 `type` 字段（expense/income）
- [ ] 确认数据库表结构符合查询需求
- [ ] 确认相关索引已创建（user_id, created_at 等）

### 5.2 实现顺序

1. **创建 DTO 文件**（5分钟）
2. **创建 Service 文件**（2-3小时）
3. **创建 Controller 文件**（10分钟）
4. **创建 Module 文件**（5分钟）
5. **注册模块**（2分钟）
6. **测试验证**（30分钟）

**总预计时间：** 3-4 小时

---

## 6. 实现步骤

### 6.1 创建模块文件

#### Step 6.1: 创建 DTO 文件

**文件**: `backend/src/dashboard/dto/overview.dto.ts`

```typescript
import { IsInt, IsNotEmpty } from 'class-validator';

export class OverviewDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;
}
```

**文件**: `backend/src/dashboard/dto/activities.dto.ts`

```typescript
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class ActivitiesDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  limit?: number = 10;
}
```

#### Step 6.2: 创建 Service 文件

**文件**: `backend/src/dashboard/dashboard.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Diary } from '../diary/diary.entity';
import { PhotoWall } from '../photo_wall/photo_wall.entity';
import { FinanceRecord } from '../finance_record/entities/finance_record.entity';
import { QuizRecord } from '../quiz_record/quiz_record.entity';
import { OverviewDto } from './dto/overview.dto';
import { ActivitiesDto } from './dto/activities.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Diary)
    private readonly diaryRepo: Repository<Diary>,
    @InjectRepository(PhotoWall)
    private readonly photoWallRepo: Repository<PhotoWall>,
    @InjectRepository(FinanceRecord)
    private readonly financeRecordRepo: Repository<FinanceRecord>,
    @InjectRepository(QuizRecord)
    private readonly quizRecordRepo: Repository<QuizRecord>,
  ) {}

  /**
   * 获取首页概览数据
   */
  async getOverview(dto: OverviewDto) {
    try {
      const { userId } = dto;

      // 并行查询各模块数据
      const [diaryData, photosData, financeData, studyData] = await Promise.all([
        this.getDiaryOverview(userId),
        this.getPhotosOverview(userId),
        this.getFinanceOverview(userId),
        this.getStudyOverview(userId),
      ]);

      return {
        code: 0,
        msg: 'success',
        data: {
          diary: diaryData,
          photos: photosData,
          finance: financeData,
          study: studyData,
        },
      };
    } catch (error) {
      return {
        code: 500,
        msg: '查询失败: ' + error.message,
        data: null,
      };
    }
  }

  /**
   * 获取最近动态
   */
  async getActivities(dto: ActivitiesDto) {
    try {
      const { userId, limit = 10 } = dto;

      // 并行查询各模块活动
      const [diaryActivities, photoActivities, financeActivities, studyActivities] =
        await Promise.all([
          this.getDiaryActivities(userId, limit),
          this.getPhotoActivities(userId, limit),
          this.getFinanceActivities(userId, limit),
          this.getStudyActivities(userId, limit),
        ]);

      // 合并并排序
      const allActivities = [
        ...diaryActivities,
        ...photoActivities,
        ...financeActivities,
        ...studyActivities,
      ]
        .sort((a, b) => {
          // 按时间倒序排序
          const timeA = this.parseTime(a.time);
          const timeB = this.parseTime(b.time);
          return timeB - timeA;
        })
        .slice(0, limit);

      return {
        code: 0,
        msg: 'success',
        data: allActivities,
      };
    } catch (error) {
      return {
        code: 500,
        msg: '查询失败: ' + error.message,
        data: null,
      };
    }
  }

  // ============ 私有方法：各模块数据查询 ============

  /**
   * 获取日记模块概览
   */
  private async getDiaryOverview(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 今日情绪
    const todayDiary = await this.diaryRepo.findOne({
      where: {
        user_id: userId,
        diary_date: today,
        is_deleted: false,
      },
      order: { created_at: 'DESC' },
    });

    // 本周日记数
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // 本周一
    const weekCount = await this.diaryRepo.count({
      where: {
        user_id: userId,
        diary_date: Between(weekStart, today),
        is_deleted: false,
      },
    });

    // 连续记录天数（简化版，可调用 diary.service 的 getStreakDays）
    const streak = await this.calculateDiaryStreak(userId);

    return {
      todayMood: todayDiary?.mood || null,
      weekCount,
      streak,
    };
  }

  /**
   * 获取照片墙模块概览
   * 注意：如果 PhotoWall 实体没有 user_id 字段，需要调整查询逻辑
   */
  private async getPhotosOverview(userId: number) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    // 方案 A：如果 PhotoWall 有 user_id 字段
    const [total, weekAdded] = await Promise.all([
      this.photoWallRepo.count({
        where: { user_id: userId, is_deleted: false } as any, // 如果字段不存在，需要调整
      }),
      this.photoWallRepo.count({
        where: {
          user_id: userId,
          created_at: MoreThanOrEqual(weekStart),
          is_deleted: false,
        } as any,
      }),
    ]);

    // 方案 B：如果 PhotoWall 没有 user_id 字段（单用户系统）
    // const [total, weekAdded] = await Promise.all([
    //   this.photoWallRepo.count(),
    //   this.photoWallRepo.count({
    //     where: {
    //       created_at: MoreThanOrEqual(weekStart),
    //     },
    //   }),
    // ]);

    return {
      total,
      weekAdded,
    };
  }

  /**
   * 获取财务模块概览
   * 注意：如果 FinanceRecord 实体没有 user_id 或 type 字段，需要调整查询逻辑
   */
  private async getFinanceOverview(userId: number) {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    // 方案 A：如果 FinanceRecord 有 user_id 和 type 字段
    const monthExpenseQuery = this.financeRecordRepo
      .createQueryBuilder('record')
      .select('SUM(CAST(record.amount AS DECIMAL(12,2)))', 'sum')
      .where('record.user_id = :userId', { userId })
      .andWhere('YEAR(record.created_at) = YEAR(CURDATE())')
      .andWhere('MONTH(record.created_at) = MONTH(CURDATE())');
    
    // 如果有 type 字段，过滤支出
    // monthExpenseQuery.andWhere('record.type = :type', { type: 'expense' });
    
    const monthExpense = await monthExpenseQuery.getRawOne();

    // 本周记账笔数
    const weekRecords = await this.financeRecordRepo.count({
      where: {
        user_id: userId, // 如果字段不存在，需要移除
        created_at: MoreThanOrEqual(weekStart),
      } as any,
    });

    // 本周支出
    const weekExpenseQuery = this.financeRecordRepo
      .createQueryBuilder('record')
      .select('SUM(CAST(record.amount AS DECIMAL(12,2)))', 'sum')
      .where('record.user_id = :userId', { userId })
      .andWhere('record.created_at >= :weekStart', { weekStart });
    
    // 如果有 type 字段，过滤支出
    // weekExpenseQuery.andWhere('record.type = :type', { type: 'expense' });
    
    const weekExpense = await weekExpenseQuery.getRawOne();

    // 方案 B：如果 FinanceRecord 没有 user_id 字段（单用户系统）
    // 移除所有 user_id 相关的查询条件

    return {
      monthExpense: parseFloat(monthExpense?.sum || '0'),
      weekRecords,
      weekExpense: parseFloat(weekExpense?.sum || '0'),
    };
  }

  /**
   * 获取学习模块概览
   */
  private async getStudyOverview(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    // 今日做题数
    const todayCount = await this.quizRecordRepo.count({
      where: {
        userId,
        createdAt: MoreThanOrEqual(today),
      },
    });

    // 本周做题数和正确率
    const weekStats = await this.quizRecordRepo
      .createQueryBuilder('record')
      .select('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN record.isCorrect = 1 THEN 1 ELSE 0 END)', 'correct')
      .where('record.userId = :userId', { userId })
      .andWhere('record.createdAt >= :weekStart', { weekStart })
      .getRawOne();

    const weekCount = parseInt(weekStats?.total || '0');
    const correctCount = parseInt(weekStats?.correct || '0');
    const weekAccuracy =
      weekCount > 0 ? `${Math.round((correctCount / weekCount) * 100)}%` : '0%';

    return {
      todayCount,
      weekCount,
      weekAccuracy,
    };
  }

  // ============ 私有方法：各模块活动查询 ============

  /**
   * 获取日记活动
   */
  private async getDiaryActivities(userId: number, limit: number) {
    const diaries = await this.diaryRepo.find({
      where: { user_id: userId, is_deleted: false },
      order: { created_at: 'DESC' },
      take: limit,
    });

    return diaries.map((diary) => ({
      id: diary.id.toString(),
      type: 'diary',
      time: this.formatTime(diary.created_at),
      title: `写了日记「${diary.title || diary.content.substring(0, 20)}」`,
      actionText: '查看',
      actionUrl: `/diary/${diary.id}`,
    }));
  }

  /**
   * 获取照片活动
   * 注意：如果 PhotoWall 实体没有 user_id 字段，需要调整查询逻辑
   */
  private async getPhotoActivities(userId: number, limit: number) {
    // 方案 A：如果 PhotoWall 有 user_id 字段
    const photos = await this.photoWallRepo.find({
      where: { user_id: userId, is_deleted: false } as any, // 如果字段不存在，需要调整
      order: { created_at: 'DESC' },
      take: limit,
    });
    
    // 方案 B：如果 PhotoWall 没有 user_id 字段
    // const photos = await this.photoWallRepo.find({
    //   order: { created_at: 'DESC' },
    //   take: limit,
    // });

    // 按日期分组，聚合为"上传了N张照片"
    const grouped = this.groupByDate(photos, 'created_at');
    return grouped.map((group) => ({
      id: null,
      type: 'photos',
      time: this.formatTime(group.date),
      title: `上传了${group.count}张照片`,
      actionText: '查看',
      actionUrl: '/photos',
    }));
  }

  /**
   * 获取财务活动
   * 注意：如果 FinanceRecord 实体没有 user_id 或 type 字段，需要调整查询逻辑
   */
  private async getFinanceActivities(userId: number, limit: number) {
    // 方案 A：如果 FinanceRecord 有 user_id 字段
    const records = await this.financeRecordRepo.find({
      where: { user_id: userId } as any, // 如果字段不存在，需要调整
      order: { created_at: 'DESC' },
      take: limit,
    });
    
    // 方案 B：如果 FinanceRecord 没有 user_id 字段
    // const records = await this.financeRecordRepo.find({
    //   order: { created_at: 'DESC' },
    //   take: limit,
    // });

    return records.map((record) => {
      // 如果 record 没有 type 字段，默认显示为支出
      const isExpense = (record as any).type === 'expense' || !(record as any).type;
      return {
        id: record.id.toString(),
        type: 'finance',
        time: this.formatTime(record.created_at),
        title: `记账 ${isExpense ? '-' : '+'}${record.amount}元 [${record.purpose || ''}]`,
        actionText: '详情',
        actionUrl: `/finance/${record.id}`,
      };
    });
  }

  /**
   * 获取学习活动
   */
  private async getStudyActivities(userId: number, limit: number) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const stats = await this.quizRecordRepo
      .createQueryBuilder('record')
      .select('DATE(record.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(CASE WHEN record.isCorrect = 1 THEN 1 ELSE 0 END)', 'correct')
      .addSelect('MAX(record.createdAt)', 'lastTime')
      .where('record.userId = :userId', { userId })
      .andWhere('record.createdAt >= :weekStart', { weekStart })
      .groupBy('DATE(record.createdAt)')
      .orderBy('date', 'DESC')
      .limit(limit)
      .getRawMany();

    return stats.map((stat) => {
      const count = parseInt(stat.count);
      const correct = parseInt(stat.correct);
      const accuracy = count > 0 ? `${Math.round((correct / count) * 100)}%` : '0%';
      return {
        id: null,
        type: 'study',
        time: this.formatTime(stat.lastTime),
        title: `完成${count}道题，正确率${accuracy}`,
        actionText: '继续',
        actionUrl: '/study',
      };
    });
  }

  // ============ 工具方法 ============

  /**
   * 计算日记连续记录天数
   */
  private async calculateDiaryStreak(userId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const rows = await this.diaryRepo
      .createQueryBuilder('diary')
      .select("DATE_FORMAT(diary.diary_date, '%Y-%m-%d')", 'date')
      .where('diary.user_id = :userId', { userId })
      .andWhere('diary.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere('diary.diary_date >= :start', { start: thirtyDaysAgo })
      .groupBy('date')
      .orderBy('date', 'DESC')
      .getRawMany<{ date: string }>();

    const dates = rows.map((r) => r.date);
    let streak = 0;

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (dates.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }

  /**
   * 格式化时间为 "MM-DD HH:mm"
   */
  private formatTime(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  }

  /**
   * 解析时间为时间戳（用于排序）
   */
  private parseTime(timeStr: string): number {
    const [datePart, timePart] = timeStr.split(' ');
    const [month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    const year = new Date().getFullYear();
    return new Date(year, month - 1, day, hours, minutes).getTime();
  }

  /**
   * 按日期分组
   */
  private groupByDate<T>(items: T[], dateField: keyof T): Array<{ date: Date; count: number }> {
    const map = new Map<string, { date: Date; count: number }>();

    items.forEach((item) => {
      const date = item[dateField] as unknown as Date;
      const dateStr = date.toISOString().split('T')[0];

      if (!map.has(dateStr)) {
        map.set(dateStr, { date, count: 0 });
      }
      map.get(dateStr)!.count++;
    });

    return Array.from(map.values());
  }
}
```

#### Step 6.3: 创建 Controller 文件

**文件**: `backend/src/dashboard/dashboard.controller.ts`

```typescript
import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { OverviewDto } from './dto/overview.dto';
import { ActivitiesDto } from './dto/activities.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * 获取首页概览数据
   * GET /api/dashboard/overview
   */
  @Get('overview')
  getOverview(@Query('userId', ParseIntPipe) userId: number) {
    const dto: OverviewDto = { userId };
    return this.dashboardService.getOverview(dto);
  }

  /**
   * 获取最近动态
   * GET /api/dashboard/activities
   */
  @Get('activities')
  getActivities(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('limit') limit?: number,
  ) {
    const dto: ActivitiesDto = {
      userId,
      limit: limit ? parseInt(String(limit)) : 10,
    };
    return this.dashboardService.getActivities(dto);
  }
}
```

#### Step 6.4: 创建 Module 文件

**文件**: `backend/src/dashboard/dashboard.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Diary } from '../diary/diary.entity';
import { PhotoWall } from '../photo_wall/photo_wall.entity';
import { FinanceRecord } from '../finance_record/entities/finance_record.entity';
import { QuizRecord } from '../quiz_record/quiz_record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Diary, PhotoWall, FinanceRecord, QuizRecord]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
```

#### Step 6.5: 注册模块

**文件**: `backend/src/app.module.ts`

在 `imports` 数组中添加：

```typescript
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    // ... 其他模块
    DashboardModule,
  ],
  // ...
})
export class AppModule {}
```

---

## 6. 重要注意事项

### 7.1 实体字段检查 ⚠️

**重要：** 在实现前，请先检查以下实体的字段定义：

1. **PhotoWall 实体**
   - 当前可能没有 `user_id` 字段
   - 如果无 `user_id`，需要：
     - 方案 A：添加 `user_id` 字段（推荐）
     - 方案 B：查询所有照片（如果系统是单用户）

2. **FinanceRecord 实体**
   - 当前可能没有 `user_id` 字段
   - 当前可能没有 `type` 字段（expense/income）
   - 如果无 `user_id`，需要添加
   - 如果无 `type`，需要：
     - 方案 A：添加 `type` 字段区分支出/收入
     - 方案 B：所有记录都视为支出（简化实现）

3. **PhotoWall 实体**
   - 当前可能没有 `is_deleted` 字段
   - 如果无，查询时不需要过滤 `is_deleted`

**建议：** 在实现前，先检查数据库表结构，确认字段是否存在。如果不存在，需要先添加字段或调整查询逻辑。

### 7.2 性能优化

1. **并行查询**: 使用 `Promise.all` 并行查询各模块数据
2. **索引优化**: 确保相关字段有索引（user_id, created_at, diary_date 等）
3. **查询限制**: 最近动态查询限制数量，避免返回过多数据

### 6.2 错误处理

- 所有查询都使用 try-catch 包裹
- 返回统一的错误格式：`{ code: 500, msg: '错误信息', data: null }`
- 单个模块查询失败不应影响其他模块

### 7.3 数据一致性

- 确保时间计算使用服务器时区
- 周的开始时间统一为周一（`WEEKDAY(CURDATE())`）
- 月份计算使用 `YEAR()` 和 `MONTH()` 函数

### 7.4 空值处理

- 如果某个模块无数据，返回合理的默认值（0、null、空数组等）
- 前端已处理空值情况，后端只需确保不返回 undefined

---

## 8. 测试要求

### 8.1 单元测试

- 测试各模块数据查询逻辑
- 测试数据聚合和排序
- 测试错误处理

### 8.2 集成测试

- 测试完整 API 调用流程
- 测试多用户数据隔离
- 测试边界情况（无数据、大量数据等）

### 8.3 性能测试

- 响应时间 < 500ms（PRD 要求）
- 并发请求测试
- 数据库查询优化验证

---

## 9. 验收标准

### 9.1 功能验收

- [ ] `GET /api/dashboard/overview` 返回正确的数据格式
- [ ] `GET /api/dashboard/activities` 返回正确的数据格式
- [ ] 各模块数据计算准确
- [ ] 最近动态按时间倒序
- [ ] 空数据情况处理正确

### 9.2 性能验收

- [ ] API 响应时间 < 500ms
- [ ] 数据库查询使用索引
- [ ] 无 N+1 查询问题

### 9.3 代码质量

- [ ] 代码符合 NestJS 规范
- [ ] 错误处理完善
- [ ] 代码注释清晰
- [ ] 无 TypeScript 类型错误

---

## 10. 后续优化建议

### 10.1 缓存策略

- 考虑使用 Redis 缓存概览数据（缓存 5 分钟）
- 减少数据库查询压力

### 10.2 数据预聚合

- 可以考虑在后台定时任务中预计算统计数据
- 存储在统计表中，查询时直接读取

### 10.3 分页优化

- 如果动态数据量大，考虑实现游标分页
- 避免使用 OFFSET，改用 WHERE id > lastId

---

## 11. 参考资源

### 11.1 相关文档

- [NestJS 官方文档](https://docs.nestjs.com/)
- [TypeORM 官方文档](https://typeorm.io/)
- [PRD FR-007](./prd-frontend-optimization.md#47-dashboard-api-开发-fr-007)

### 11.2 参考代码

- `backend/src/diary/diary.service.ts` - 日记服务实现
- `backend/src/finance_record/finance_record.service.ts` - 财务服务实现
- `backend/src/quiz_record/quiz_record.service.ts` - 学习服务实现

---

*— End of Document —*

*— Backend Development Team —*

