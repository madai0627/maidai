import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  Like,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { Diary, MOOD_LABELS } from './diary.entity';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { ListDiaryDto, MoodStatsDto, CalendarDto } from './dto/list-diary.dto';

@Injectable()
export class DiaryService {
  constructor(
    @InjectRepository(Diary)
    private readonly diaryRepo: Repository<Diary>,
  ) {}

  /**
   * 创建日记
   */
  async create(dto: CreateDiaryDto) {
    try {
      const diary = this.diaryRepo.create({
        user_id: dto.userId,
        title: dto.title || '',
        content: dto.content || '',
        mood: dto.mood,
        diary_date: new Date(dto.diaryDate),
        images: dto.images || [],
        tags: dto.tags || [],
        weather: dto.weather || null,
        location: dto.location || null,
        is_deleted: false,
      });

      await this.diaryRepo.save(diary);
      return { code: 0, msg: '创建成功', data: diary };
    } catch (error) {
      return { code: 500, msg: '创建失败: ' + error.message, data: null };
    }
  }

  /**
   * 获取日记详情
   */
  async findOne(id: number, userId: number) {
    try {
      const diary = await this.diaryRepo.findOne({
        where: { id, user_id: userId, is_deleted: false },
      });

      if (!diary) {
        return { code: 404, msg: '日记不存在', data: null };
      }

      return { code: 0, msg: 'success', data: diary };
    } catch (error) {
      return { code: 500, msg: '查询失败: ' + error.message, data: null };
    }
  }

  /**
   * 更新日记
   */
  async update(id: number, userId: number, dto: UpdateDiaryDto) {
    try {
      const diary = await this.diaryRepo.findOne({
        where: { id, user_id: userId, is_deleted: false },
      });

      if (!diary) {
        return { code: 404, msg: '日记不存在', data: null };
      }

      // 构建更新数据
      const updateData: Partial<Diary> = {};
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.content !== undefined) updateData.content = dto.content;
      if (dto.mood !== undefined) updateData.mood = dto.mood;
      if (dto.diaryDate !== undefined) updateData.diary_date = new Date(dto.diaryDate);
      if (dto.images !== undefined) updateData.images = dto.images;
      if (dto.tags !== undefined) updateData.tags = dto.tags;
      if (dto.weather !== undefined) updateData.weather = dto.weather;
      if (dto.location !== undefined) updateData.location = dto.location;

      await this.diaryRepo.update(id, updateData);
      const updated = await this.diaryRepo.findOneBy({ id });

      return { code: 0, msg: '更新成功', data: updated };
    } catch (error) {
      return { code: 500, msg: '更新失败: ' + error.message, data: null };
    }
  }

  /**
   * 删除日记（软删除）
   */
  async remove(id: number, userId: number) {
    try {
      const diary = await this.diaryRepo.findOne({
        where: { id, user_id: userId, is_deleted: false },
      });

      if (!diary) {
        return { code: 404, msg: '日记不存在', data: null };
      }

      await this.diaryRepo.update(id, { is_deleted: true });
      return { code: 0, msg: '删除成功', data: null };
    } catch (error) {
      return { code: 500, msg: '删除失败: ' + error.message, data: null };
    }
  }

  /**
   * 获取日记列表（分页+筛选）
   */
  async list(dto: ListDiaryDto) {
    try {
      const page = Number(dto.page || 1);
      const pageSize = Number(dto.pageSize || 10);
      const where: FindOptionsWhere<Diary> = {
        is_deleted: false,
      };

      // 用户ID必须
      if (dto.userId) {
        where.user_id = dto.userId;
      }

      // 情绪筛选
      if (dto.mood) {
        where.mood = dto.mood;
      }

      // 日期范围筛选
      if (dto.startDate && dto.endDate) {
        where.diary_date = Between(new Date(dto.startDate), new Date(dto.endDate));
      } else if (dto.startDate) {
        where.diary_date = MoreThanOrEqual(new Date(dto.startDate));
      } else if (dto.endDate) {
        where.diary_date = LessThanOrEqual(new Date(dto.endDate));
      }

      // 关键词搜索需要使用 QueryBuilder
      if (dto.keyword) {
        const qb = this.diaryRepo
          .createQueryBuilder('diary')
          .where('diary.is_deleted = :isDeleted', { isDeleted: false });

        if (dto.userId) {
          qb.andWhere('diary.user_id = :userId', { userId: dto.userId });
        }
        if (dto.mood) {
          qb.andWhere('diary.mood = :mood', { mood: dto.mood });
        }
        if (dto.startDate) {
          qb.andWhere('diary.diary_date >= :startDate', { startDate: dto.startDate });
        }
        if (dto.endDate) {
          qb.andWhere('diary.diary_date <= :endDate', { endDate: dto.endDate });
        }

        // 关键词搜索标题和内容
        qb.andWhere('(diary.title LIKE :keyword OR diary.content LIKE :keyword)', {
          keyword: `%${dto.keyword}%`,
        });

        qb.orderBy('diary.diary_date', 'DESC').addOrderBy('diary.id', 'DESC');

        const [list, total] = await qb
          .skip((page - 1) * pageSize)
          .take(pageSize)
          .getManyAndCount();

        return { code: 0, msg: 'success', data: { list, total, page, pageSize } };
      }

      // 普通查询
      const [list, total] = await this.diaryRepo.findAndCount({
        where,
        order: { diary_date: 'DESC', id: 'DESC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      return { code: 0, msg: 'success', data: { list, total, page, pageSize } };
    } catch (error) {
      return { code: 500, msg: '查询失败: ' + error.message, data: null };
    }
  }

  /**
   * 情绪统计
   */
  async getMoodStats(dto: MoodStatsDto) {
    try {
      const { userId, month } = dto;

      // 计算月份范围
      let startDate: Date;
      let endDate: Date;

      if (month) {
        const [year, mon] = month.split('-').map(Number);
        startDate = new Date(year, mon - 1, 1);
        endDate = new Date(year, mon, 0, 23, 59, 59, 999);
      } else {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }

      // 统计各情绪数量
      const qb = this.diaryRepo
        .createQueryBuilder('diary')
        .select('diary.mood', 'mood')
        .addSelect('COUNT(*)', 'count')
        .where('diary.is_deleted = :isDeleted', { isDeleted: false })
        .andWhere('diary.diary_date BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        });

      if (userId) {
        qb.andWhere('diary.user_id = :userId', { userId });
      }

      const rows = await qb.groupBy('diary.mood').getRawMany<{ mood: string; count: string }>();

      // 计算总数和百分比
      const total = rows.reduce((sum, r) => sum + Number(r.count), 0);

      const data = Object.keys(MOOD_LABELS).map((mood) => {
        const row = rows.find((r) => r.mood === mood);
        const count = row ? Number(row.count) : 0;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        return {
          mood,
          name: MOOD_LABELS[mood].label,
          emoji: MOOD_LABELS[mood].emoji,
          color: MOOD_LABELS[mood].color,
          value: count,
          percent,
        };
      });

      return { code: 0, msg: 'success', data };
    } catch (error) {
      return { code: 500, msg: '统计失败: ' + error.message, data: null };
    }
  }

  /**
   * 日历数据
   */
  async getCalendarData(dto: CalendarDto) {
    try {
      const { userId, month } = dto;

      // 计算月份范围
      let startDate: Date;
      let endDate: Date;

      if (month) {
        const [year, mon] = month.split('-').map(Number);
        startDate = new Date(year, mon - 1, 1);
        endDate = new Date(year, mon, 0, 23, 59, 59, 999);
      } else {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }

      // 获取该月所有日记的日期和情绪
      const qb = this.diaryRepo
        .createQueryBuilder('diary')
        .select("DATE_FORMAT(diary.diary_date, '%Y-%m-%d')", 'date')
        .addSelect('diary.mood', 'mood')
        .addSelect('diary.id', 'id')
        .where('diary.is_deleted = :isDeleted', { isDeleted: false })
        .andWhere('diary.diary_date BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        });

      if (userId) {
        qb.andWhere('diary.user_id = :userId', { userId });
      }

      const rows = await qb
        .orderBy('diary.diary_date', 'ASC')
        .getRawMany<{ date: string; mood: string; id: number }>();

      // 按日期分组
      const calendarMap: Record<string, { mood: string; count: number }> = {};
      rows.forEach((row) => {
        if (!calendarMap[row.date]) {
          calendarMap[row.date] = { mood: row.mood, count: 1 };
        } else {
          calendarMap[row.date].count++;
        }
      });

      const data = Object.entries(calendarMap).map(([date, info]) => ({
        date,
        mood: info.mood,
        count: info.count,
        emoji: MOOD_LABELS[info.mood]?.emoji || '📝',
      }));

      return { code: 0, msg: 'success', data };
    } catch (error) {
      return { code: 500, msg: '查询失败: ' + error.message, data: null };
    }
  }

  /**
   * 获取连续记录天数
   */
  async getStreakDays(userId: number) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 获取最近30天的日记日期
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

      // 计算连续天数
      let streak = 0;
      const dates = rows.map((r) => r.date);

      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        if (dates.includes(dateStr)) {
          streak++;
        } else if (i > 0) {
          // 如果不是今天，且没有记录，则中断
          break;
        }
      }

      return { code: 0, msg: 'success', data: { streak } };
    } catch (error) {
      return { code: 500, msg: '查询失败: ' + error.message, data: null };
    }
  }
}

