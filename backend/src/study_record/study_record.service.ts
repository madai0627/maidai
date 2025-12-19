import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, In } from 'typeorm';
import { ExerciseRecord } from './entities/exercise_record.entity';
import { ExerciseRecordItem } from './entities/exercise_record_item.entity';
import { WrongQuestion } from './entities/wrong_question.entity';
import { QuizQuestion } from '../quiz_question/quiz_question.entity';

/**
 * 学习记录 & 错题服务
 * 尽量保持职责单一，方便后续扩展统计逻辑
 */
@Injectable()
export class StudyRecordService {
  constructor(
    @InjectRepository(ExerciseRecord)
    private readonly exerciseRecordRepo: Repository<ExerciseRecord>,
    @InjectRepository(ExerciseRecordItem)
    private readonly exerciseRecordItemRepo: Repository<ExerciseRecordItem>,
    @InjectRepository(WrongQuestion)
    private readonly wrongQuestionRepo: Repository<WrongQuestion>,
    @InjectRepository(QuizQuestion)
    private readonly questionRepo: Repository<QuizQuestion>,
  ) {}

  /**
   * 创建一次会话级做题记录（包含多道题）
   * 会自动：
   * - 写入 exercise_record、exercise_record_item
   * - 更新 wrong_question 表
   */
  async createExerciseRecord(payload: {
    userId: number;
    sourceType?: number;
    sourceId?: number;
    subjectCode?: string;
    startTime?: string | Date;
    endTime?: string | Date;
    items: Array<{
      questionId: number;
      userAnswer: string;
      isCorrect: boolean;
      score?: number;
      maxScore?: number;
      durationSeconds?: number;
      isMarkedWrong?: boolean;
    }>;
  }) {
    const {
      userId,
      sourceType = 1,
      sourceId = null,
      subjectCode = null,
      startTime,
      endTime,
      items,
    } = payload;

    if (!userId || !Array.isArray(items) || items.length === 0) {
      throw new Error('参数不合法：userId 或 items 不能为空');
    }

    // 计算基础统计
    const totalCount = items.length;
    const correctCount = items.filter((i) => i.isCorrect).length;
    const wrongCount = totalCount - correctCount;
    const score = items.reduce(
      (sum, i) => sum + (i.score ?? (i.isCorrect ? 10 : 0)),
      0,
    );
    const maxScore = items.reduce(
      (sum, i) => sum + (i.maxScore ?? 10),
      0,
    );
    const accuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

    const now = new Date();
    const start = startTime ? new Date(startTime) : now;
    const end = endTime ? new Date(endTime) : now;
    const durationSeconds = Math.max(
      0,
      Math.floor((end.getTime() - start.getTime()) / 1000),
    );

    // 创建会话记录实体
    const record = this.exerciseRecordRepo.create({
      userId,
      sourceType,
      sourceId,
      subjectCode,
      startTime: start,
      endTime: end,
      durationSeconds,
      totalCount,
      correctCount,
      wrongCount,
      score,
      maxScore,
      accuracy,
    });

    // 先保存会话记录，拿到 record.id
    const savedRecord = await this.exerciseRecordRepo.save(record);

    // 逐题构建明细记录并更新错题本
    for (const item of items) {
      const question = await this.questionRepo.findOne({
        where: { id: item.questionId },
      });
      if (!question) {
        // 如果题目不存在，跳过该题，避免整体失败
        // 这里可以根据需要记录日志
        continue;
      }

      const recordItem = this.exerciseRecordItemRepo.create({
        record: savedRecord,
        userId,
        question,
        subjectCode,
        userAnswer: item.userAnswer,
        isCorrect: item.isCorrect,
        score: item.score ?? (item.isCorrect ? 10 : 0),
        maxScore: item.maxScore ?? 10,
        durationSeconds: item.durationSeconds ?? 0,
        submitTime: end,
        isMarkedWrong: item.isMarkedWrong ?? true,
      });

      await this.exerciseRecordItemRepo.save(recordItem);

      // 更新错题本
      if (recordItem.isMarkedWrong) {
        await this.updateWrongQuestionByItem(recordItem, sourceType, sourceId);
      }
    }

    return savedRecord;
  }

  /**
   * 根据单题记录更新错题本
   */
  private async updateWrongQuestionByItem(
    item: ExerciseRecordItem,
    sourceType: number,
    sourceId: number | null,
  ) {
    const userId = item.userId;
    const question = item.question;

    let wrong = await this.wrongQuestionRepo.findOne({
      where: { userId, question, isDeleted: 0 },
    });

    const now = new Date();

    if (!item.isCorrect) {
      // 做错题目：新增或更新错题记录
      if (!wrong) {
        wrong = this.wrongQuestionRepo.create({
          userId,
          question,
          subjectCode: null,
          knowledgeCodes: null,
          firstWrongTime: now,
          lastWrongTime: now,
          wrongCount: 1,
          correctAfterWrongCount: 0,
          status: 0,
          lastSourceType: sourceType,
          lastSourceId: sourceId,
          isDeleted: 0,
        });
      } else {
        wrong.lastWrongTime = now;
        wrong.wrongCount += 1;
        wrong.lastSourceType = sourceType;
        wrong.lastSourceId = sourceId;
      }

      await this.wrongQuestionRepo.save(wrong);
    } else {
      // 做对题目：如果之前存在错题记录，则增加 correctAfterWrongCount
      if (wrong) {
        wrong.correctAfterWrongCount += 1;
        await this.wrongQuestionRepo.save(wrong);
      }
    }
  }

  /**
   * 分页获取用户会话级做题记录
   */
  async getExerciseRecords(params: {
    userId: number;
    page?: number;
    pageSize?: number;
  }) {
    const { userId, page = 1, pageSize = 20 } = params;
    const [list, total] = await this.exerciseRecordRepo.findAndCount({
      where: { userId },
      order: { startTime: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { total, list };
  }

  /**
   * 获取单次会话记录详情（包含题目明细）
   */
  async getExerciseRecordDetail(id: number, userId: number) {
    const record = await this.exerciseRecordRepo.findOne({
      where: { id, userId },
    });
    if (!record) {
      throw new Error('记录不存在或无权访问');
    }

    const items = await this.exerciseRecordItemRepo.find({
      where: { record: { id }, userId },
      order: { id: 'ASC' },
    });

    return { record, items };
  }

  /**
   * 获取用户错题列表（不分页版，可按需要扩展）
   */
  async getWrongQuestions(userId: number) {
    return this.wrongQuestionRepo.find({
      where: { userId, isDeleted: 0 },
      relations: ['question', 'question.category'],
      order: { lastWrongTime: 'DESC' },
    });
  }

  /**
   * 获取学习概览数据（用于首页）
   * @param userId 用户ID
   * @param range 时间范围：'7d' | '30d'
   */
  async getLearningOverview(params: {
    userId: number;
    range?: string;
  }) {
    const { userId, range = '7d' } = params;

    // 计算时间范围
    const now = new Date();
    const days = range === '30d' ? 30 : 7;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    // 获取指定时间范围内的记录
    const records = await this.exerciseRecordRepo.find({
      where: {
        userId,
        startTime: MoreThanOrEqual(startDate),
      },
    });

    // 获取所有题目明细
    const recordIds = records.map((r) => r.id);
    const items =
      recordIds.length > 0
        ? await this.exerciseRecordItemRepo.find({
            where: {
              record: { id: In(recordIds) },
            },
            relations: ['question', 'question.category'],
          })
        : [];

    // 计算统计
    const totalExercises = records.length;
    const totalQuestions = items.length;
    const correctQuestions = items.filter((i) => i.isCorrect).length;
    const avgAccuracy =
      totalQuestions > 0
        ? ((correctQuestions / totalQuestions) * 100).toFixed(1)
        : '0.0';

    // 计算每日正确率趋势（最近7天）
    const accuracyTrend = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayRecords = records.filter((r) => {
        const rDate = new Date(r.startTime);
        return rDate >= dayStart && rDate < dayEnd;
      });

      const dayRecordIds = dayRecords.map((r) => r.id);
      const dayItems =
        dayRecordIds.length > 0
          ? await this.exerciseRecordItemRepo.find({
              where: {
                record: { id: In(dayRecordIds) },
              },
            })
          : [];

      const dayTotal = dayItems.length;
      const dayCorrect = dayItems.filter((i) => i.isCorrect).length;
      const dayAccuracy =
        dayTotal > 0 ? (dayCorrect / dayTotal) * 100 : 0;

      accuracyTrend.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        day: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][
          date.getDay()
        ],
        accuracy: dayAccuracy / 100, // 转换为 0-1 范围
        value: dayAccuracy,
      });
    }

    // 获取薄弱知识点 TOP3（基于错题）
    const wrongQuestions = await this.wrongQuestionRepo.find({
      where: { userId, isDeleted: 0 },
      relations: ['question', 'question.category'],
      order: { wrongCount: 'DESC' },
      take: 3,
    });

    const weakKnowledgeTop = wrongQuestions.map((wq) => ({
      knowledgeCode: wq.knowledgeCodes || '',
      knowledgeName:
        wq.question?.category?.name || '未知知识点',
      accuracy: 0.4, // 简化处理，实际应该计算该知识点的正确率
      wrongCount: wq.wrongCount,
    }));

    return {
      summary: {
        totalExercises,
        totalQuestions,
        avgAccuracy,
        improvementRate: 0, // 简化处理，实际应该与上一周期对比
      },
      accuracyTrend,
      weakKnowledgeTop,
    };
  }

  /**
   * 获取详细学习统计数据（用于统计页面）
   * @param userId 用户ID
   * @param range 时间范围：'7d' | '30d'
   * @param startDate 自定义开始日期
   * @param endDate 自定义结束日期
   */
  async getLearningDetail(params: {
    userId: number;
    range?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { userId, range, startDate, endDate } = params;

    // 计算时间范围
    let start: Date;
    let end: Date = new Date();

    if (startDate && endDate) {
      // 自定义日期范围
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // 使用预设范围
      const days = range === '30d' ? 30 : 7;
      start = new Date();
      start.setDate(start.getDate() - days);
    }

    // 获取指定时间范围内的记录
    const records = await this.exerciseRecordRepo.find({
      where: {
        userId,
        startTime: MoreThanOrEqual(start),
      },
    });

    // 手动过滤结束时间（因为 TypeORM 的日期范围查询需要更复杂的条件）
    const filteredRecords = records.filter((r) => {
      const rDate = new Date(r.startTime);
      return rDate <= end;
    });

    // 获取所有题目明细
    const recordIds = filteredRecords.map((r) => r.id);
    const items =
      recordIds.length > 0
        ? await this.exerciseRecordItemRepo.find({
            where: {
              record: { id: In(recordIds) },
            },
            relations: ['question', 'question.category'],
          })
        : [];

    // 计算基础统计
    const totalExercises = filteredRecords.length;
    const totalQuestions = items.length;
    const correctQuestions = items.filter((i) => i.isCorrect).length;
    const avgAccuracy =
      totalQuestions > 0
        ? ((correctQuestions / totalQuestions) * 100).toFixed(1)
        : '0.0';

    // 计算正确率趋势（按天）
    const accuracyTrend = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
      );
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayRecords = filteredRecords.filter((r) => {
        const rDate = new Date(r.startTime);
        return rDate >= dayStart && rDate < dayEnd;
      });

      const dayRecordIds = dayRecords.map((r) => r.id);
      const dayItems =
        dayRecordIds.length > 0
          ? await this.exerciseRecordItemRepo.find({
              where: {
                record: { id: In(dayRecordIds) },
              },
            })
          : [];

      const dayTotal = dayItems.length;
      const dayCorrect = dayItems.filter((i) => i.isCorrect).length;
      const dayAccuracy =
        dayTotal > 0 ? (dayCorrect / dayTotal) * 100 : 0;

      accuracyTrend.push({
        date: `${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
        day: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][
          currentDate.getDay()
        ],
        accuracy: dayAccuracy / 100,
        value: dayAccuracy,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 科目分布统计
    const subjectMap = new Map();
    items.forEach((item) => {
      const subject = item.subjectCode || item.question?.category?.name || '未知';
      if (subjectMap.has(subject)) {
        subjectMap.set(subject, subjectMap.get(subject) + 1);
      } else {
        subjectMap.set(subject, 1);
      }
    });

    const subjectDistribution = Array.from(subjectMap.entries()).map(
      ([name, value]) => ({
        name,
        value,
        count: value,
      }),
    );

    // 题型分布统计（简化处理，实际应该从题目类型字段获取）
    const questionTypeMap = new Map();
    items.forEach((item) => {
      // 这里简化处理，实际应该从 question.questionType 获取
      const type = '选择题'; // 默认类型
      if (questionTypeMap.has(type)) {
        questionTypeMap.set(type, questionTypeMap.get(type) + 1);
      } else {
        questionTypeMap.set(type, 1);
      }
    });

    const questionTypeStats = Array.from(questionTypeMap.entries()).map(
      ([name, value]) => ({
        name,
        value,
        count: value,
      }),
    );

    // 薄弱知识点 TOP3
    const wrongQuestions = await this.wrongQuestionRepo.find({
      where: { userId, isDeleted: 0 },
      relations: ['question', 'question.category'],
      order: { wrongCount: 'DESC' },
      take: 3,
    });

    const weakKnowledgeTop = wrongQuestions.map((wq) => ({
      knowledgeCode: wq.knowledgeCodes || '',
      knowledgeName:
        wq.question?.category?.name || '未知知识点',
      accuracy: 0.4, // 简化处理
      wrongCount: wq.wrongCount,
    }));

    return {
      summary: {
        totalExercises,
        totalQuestions,
        avgAccuracy,
        improvementRate: 0,
      },
      accuracyTrend,
      subjectDistribution,
      questionTypeStats,
      weakKnowledgeTop,
    };
  }
}


