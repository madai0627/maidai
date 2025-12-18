import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
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
      const [diaryData, photosData, financeData, studyData] = await Promise.all(
        [
          this.getDiaryOverview(userId),
          this.getPhotosOverview(userId),
          this.getFinanceOverview(userId),
          this.getStudyOverview(userId),
        ],
      );

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
      const [
        diaryActivities,
        photoActivities,
        financeActivities,
        studyActivities,
      ] = await Promise.all([
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

    // 格式化日期为 YYYY-MM-DD 字符串，用于 date 类型字段比较
    const todayStr = this.formatDateString(today);

    // 本周一
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = this.formatDateString(weekStart);

    // 今日情绪 - 使用日期字符串查询
    const todayDiary = await this.diaryRepo
      .createQueryBuilder('diary')
      .where('diary.user_id = :userId', { userId })
      .andWhere('DATE(diary.diary_date) = DATE(:today)', { today: todayStr })
      .andWhere('diary.is_deleted = :isDeleted', { isDeleted: false })
      .orderBy('diary.created_at', 'DESC')
      .getOne();

    // 本周日记数 - 从本周一开始
    const weekCount = await this.diaryRepo
      .createQueryBuilder('diary')
      .where('diary.user_id = :userId', { userId })
      .andWhere('DATE(diary.diary_date) >= DATE(:weekStart)', {
        weekStart: weekStartStr,
      })
      .andWhere('DATE(diary.diary_date) <= DATE(:today)', { today: todayStr })
      .andWhere('diary.is_deleted = :isDeleted', { isDeleted: false })
      .getCount();

    // 连续记录天数
    const streak = await this.calculateDiaryStreak(userId);

    return {
      todayMood: todayDiary?.mood || null,
      weekCount,
      streak,
    };
  }

  /**
   * 获取照片墙模块概览
   */
  private async getPhotosOverview(userId: number) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    // 按 user_id 查询照片
    const [total, weekAdded] = await Promise.all([
      this.photoWallRepo.count({
        where: { user_id: userId },
      }),
      this.photoWallRepo.count({
        where: {
          user_id: userId,
          created_at: MoreThanOrEqual(weekStart),
        },
      }),
    ]);

    return {
      total,
      weekAdded,
    };
  }

  /**
   * 获取财务模块概览
   */
  private async getFinanceOverview(userId: number) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    // 按 user_id 查询财务记录
    const monthExpense = await this.financeRecordRepo
      .createQueryBuilder('record')
      .select('SUM(CAST(record.amount AS DECIMAL(12,2)))', 'sum')
      .where('record.user_id = :userId', { userId })
      .andWhere('YEAR(record.created_at) = YEAR(CURDATE())')
      .andWhere('MONTH(record.created_at) = MONTH(CURDATE())')
      .andWhere('record.category = :category', { category: '支出' })
      .getRawOne();

    // 本周记账笔数
    const weekRecords = await this.financeRecordRepo.count({
      where: {
        user_id: userId,
        created_at: MoreThanOrEqual(weekStart),
      },
    });

    // 本周支出
    const weekExpense = await this.financeRecordRepo
      .createQueryBuilder('record')
      .select('SUM(CAST(record.amount AS DECIMAL(12,2)))', 'sum')
      .where('record.user_id = :userId', { userId })
      .andWhere('record.created_at >= :weekStart', { weekStart })
      .andWhere('record.category = :category', { category: '支出' })
      .getRawOne();

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
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    try {
      // 先查询所有记录，看看数据库里有什么
      const allRecordsInDb = await this.quizRecordRepo.find({});
      console.log('[Dashboard] getStudyOverview - 数据库所有记录:', {
        total: allRecordsInDb.length,
        userIds: [...new Set(allRecordsInDb.map((r) => r.userId))],
        sampleRecords: allRecordsInDb.slice(0, 3).map((r) => ({
          id: r.id,
          userId: r.userId,
          createdAt: r.createdAt,
        })),
      });

      // 使用 Repository.find 方法，TypeORM 会自动处理字段名转换
      const allRecords = await this.quizRecordRepo.find({
        where: { userId },
      });

      console.log('[Dashboard] getStudyOverview - 查询结果:', {
        queryUserId: userId,
        totalRecords: allRecords.length,
        sampleRecord: allRecords[0]
          ? {
              id: allRecords[0].id,
              userId: allRecords[0].userId,
              createdAt: allRecords[0].createdAt,
            }
          : null,
      });

      // 今日做题数 - 使用 JavaScript 过滤
      const todayRecords = allRecords.filter((record) => {
        const recordDate = new Date(record.createdAt);
        return recordDate >= today && recordDate <= todayEnd;
      });

      // 本周做题数 - 使用 JavaScript 过滤
      const weekRecords = allRecords.filter((record) => {
        const recordDate = new Date(record.createdAt);
        return recordDate >= weekStart;
      });

      const todayCount = todayRecords.length;
      const weekCount = weekRecords.length;
      const correctCount = weekRecords.filter((r) => r.isCorrect).length;
      const weekAccuracy =
        weekCount > 0
          ? `${Math.round((correctCount / weekCount) * 100)}%`
          : '0%';

      console.log('[Dashboard] getStudyOverview - 结果:', {
        userId,
        todayCount,
        weekCount,
        correctCount,
        weekAccuracy,
        today: today.toISOString(),
        todayEnd: todayEnd.toISOString(),
        weekStart: weekStart.toISOString(),
      });

      return {
        todayCount,
        weekCount,
        weekAccuracy,
      };
    } catch (error) {
      console.error('[Dashboard] getStudyOverview - 错误:', error);
      return {
        todayCount: 0,
        weekCount: 0,
        weekAccuracy: '0%',
      };
    }
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
   */
  private async getPhotoActivities(userId: number, limit: number) {
    const photos = await this.photoWallRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit * 2, // 多取一些，用于分组
    });

    // 按日期分组，聚合为"上传了N张照片"
    const grouped = this.groupByDate(photos, 'created_at');
    return grouped.slice(0, limit).map((group) => ({
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
   */
  private async getFinanceActivities(userId: number, limit: number) {
    const records = await this.financeRecordRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
    });

    return records.map((record) => {
      const amount = parseFloat(record.amount);
      const prefix = record.category === '收入' ? '+' : '-';
      return {
        id: record.id.toString(),
        type: 'finance',
        time: this.formatTime(record.created_at),
        title: `记账 ${prefix}${Math.abs(amount)}元 [${record.purpose || ''}]`,
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
    weekStart.setHours(0, 0, 0, 0);

    try {
      // 使用 Repository.find 方法，TypeORM 会自动处理字段名转换
      const allRecords = await this.quizRecordRepo.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      console.log('[Dashboard] getStudyActivities - 所有记录:', {
        userId,
        totalRecords: allRecords.length,
      });

      // 过滤本周的记录
      const weekRecords = allRecords.filter((record) => {
        const recordDate = new Date(record.createdAt);
        return recordDate >= weekStart;
      });

      // 按日期分组
      const groupedByDate = new Map<string, any[]>();
      weekRecords.forEach((record) => {
        const dateStr = new Date(record.createdAt).toISOString().split('T')[0];
        if (!groupedByDate.has(dateStr)) {
          groupedByDate.set(dateStr, []);
        }
        groupedByDate.get(dateStr)!.push(record);
      });

      // 转换为统计格式
      const stats = Array.from(groupedByDate.entries())
        .map(([date, records]) => {
          const count = records.length;
          const correct = records.filter((r) => r.isCorrect).length;
          const accuracy =
            count > 0 ? `${Math.round((correct / count) * 100)}%` : '0%';
          const lastTime = records[0].createdAt; // 已按 DESC 排序

          return {
            date,
            count: count.toString(),
            correct: correct.toString(),
            lastTime,
            accuracy,
          };
        })
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, limit);

      console.log('[Dashboard] getStudyActivities - 结果:', {
        userId,
        weekStart: weekStart.toISOString(),
        statsCount: stats.length,
        stats: stats,
      });

      return stats.map((stat) => {
        const count = parseInt(stat.count);
        const correct = parseInt(stat.correct);
        const accuracy =
          count > 0 ? `${Math.round((correct / count) * 100)}%` : '0%';
        return {
          id: null,
          type: 'study',
          time: this.formatTime(stat.lastTime),
          title: `完成${count}道题，正确率${accuracy}`,
          actionText: '继续',
          actionUrl: '/study',
        };
      });
    } catch (error) {
      console.error('[Dashboard] getStudyActivities - 错误:', error);
      return [];
    }
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
  private formatTime(date: Date | string): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  }

  /**
   * 格式化日期为 YYYY-MM-DD 字符串
   */
  private formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
  private groupByDate<T>(
    items: T[],
    dateField: keyof T,
  ): Array<{ date: Date; count: number }> {
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
