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
      const [diaryData, photosData, financeData, studyData] = await Promise.all([
        this.getDiaryOverview(userId),
        this.getPhotosOverview(),
        this.getFinanceOverview(),
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
      const [
        diaryActivities,
        photoActivities,
        financeActivities,
        studyActivities,
      ] = await Promise.all([
        this.getDiaryActivities(userId, limit),
        this.getPhotoActivities(limit),
        this.getFinanceActivities(limit),
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
   * 注意：PhotoWall 实体没有 user_id 字段，查询所有照片
   */
  private async getPhotosOverview() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    // PhotoWall 没有 user_id 字段，查询所有照片
    const [total, weekAdded] = await Promise.all([
      this.photoWallRepo.count(),
      this.photoWallRepo.count({
        where: {
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
   * 注意：FinanceRecord 实体没有 user_id 和 type 字段
   */
  private async getFinanceOverview() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    // FinanceRecord 没有 user_id 和 type 字段，查询所有记录，所有记录视为支出
    const monthExpense = await this.financeRecordRepo
      .createQueryBuilder('record')
      .select('SUM(CAST(record.amount AS DECIMAL(12,2)))', 'sum')
      .where('YEAR(record.created_at) = YEAR(CURDATE())')
      .andWhere('MONTH(record.created_at) = MONTH(CURDATE())')
      .getRawOne();

    // 本周记账笔数
    const weekRecords = await this.financeRecordRepo.count({
      where: {
        created_at: MoreThanOrEqual(weekStart),
      },
    });

    // 本周支出
    const weekExpense = await this.financeRecordRepo
      .createQueryBuilder('record')
      .select('SUM(CAST(record.amount AS DECIMAL(12,2)))', 'sum')
      .where('record.created_at >= :weekStart', { weekStart })
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

    // 今日做题数 - 使用日期范围查询
    const todayCount = await this.quizRecordRepo
      .createQueryBuilder('record')
      .where('record.userId = :userId', { userId })
      .andWhere('record.createdAt >= :today', { today })
      .andWhere('record.createdAt <= :todayEnd', { todayEnd })
      .getCount();

    // 本周做题数和正确率
    const weekStats = await this.quizRecordRepo
      .createQueryBuilder('record')
      .select('COUNT(*)', 'total')
      .addSelect(
        'SUM(CASE WHEN record.isCorrect = 1 THEN 1 ELSE 0 END)',
        'correct',
      )
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
   * 注意：PhotoWall 没有 user_id 字段，查询所有照片
   */
  private async getPhotoActivities(limit: number) {
    const photos = await this.photoWallRepo.find({
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
   * 注意：FinanceRecord 没有 user_id 字段，查询所有记录
   */
  private async getFinanceActivities(limit: number) {
    const records = await this.financeRecordRepo.find({
      order: { created_at: 'DESC' },
      take: limit,
    });

    return records.map((record) => {
      // FinanceRecord 没有 type 字段，默认显示为支出
      return {
        id: record.id.toString(),
        type: 'finance',
        time: this.formatTime(record.created_at),
        title: `记账 -${record.amount}元 [${record.purpose || ''}]`,
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
      .addSelect(
        'SUM(CASE WHEN record.isCorrect = 1 THEN 1 ELSE 0 END)',
        'correct',
      )
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
