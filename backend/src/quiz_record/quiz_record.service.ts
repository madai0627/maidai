import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizRecord } from './quiz_record.entity';
import { QuizQuestion } from '../quiz_question/quiz_question.entity';
// 导入新数据结构实体和服务
import { ExerciseRecord } from '../study_record/entities/exercise_record.entity';
import { ExerciseRecordItem } from '../study_record/entities/exercise_record_item.entity';
import { WrongQuestion } from '../study_record/entities/wrong_question.entity';
import { StudyRecordService } from '../study_record/study_record.service';

/**
 * 答题记录服务（兼容旧接口）
 * 逐步迁移到新数据结构（exercise_record、wrong_question），保持接口路径和返回结构不变
 */
@Injectable()
export class QuizRecordService {
  constructor(
    @InjectRepository(QuizRecord)
    private readonly recordRepo: Repository<QuizRecord>,
    @InjectRepository(QuizQuestion)
    private readonly questionRepo: Repository<QuizQuestion>,
    // 新数据结构 repository
    @InjectRepository(ExerciseRecord)
    private readonly exerciseRecordRepo: Repository<ExerciseRecord>,
    @InjectRepository(ExerciseRecordItem)
    private readonly exerciseRecordItemRepo: Repository<ExerciseRecordItem>,
    @InjectRepository(WrongQuestion)
    private readonly wrongQuestionRepo: Repository<WrongQuestion>,
    // 复用新服务的方法
    private readonly studyRecordService: StudyRecordService,
  ) {}

  /**
   * 提交单题答案
   * 同时写入旧表（保持兼容）和新表（新结构）
   */
  async submitAnswer(data: {
    userId: number;
    questionId: number;
    userAnswer: string;
    score?: number;
  }) {
    const question = await this.questionRepo.findOneBy({ id: data.questionId });
    if (!question) throw new Error('题目不存在');

    const isCorrect = data.userAnswer === question.correctAnswer;
    const score = data.score || 10;

    // 1. 写入旧表（保持兼容）
    const record = this.recordRepo.create({
      userId: data.userId,
      question: question,
      userAnswer: data.userAnswer,
      isCorrect,
      score,
    });
    await this.recordRepo.save(record);

    // 2. 同时写入新结构（exercise_record_item + wrong_question）
    try {
      // 创建单题会话记录（sourceType=1 表示练习）
      await this.studyRecordService.createExerciseRecord({
        userId: data.userId,
        sourceType: 1,
        startTime: new Date(),
        endTime: new Date(),
        items: [
          {
            questionId: data.questionId,
            userAnswer: data.userAnswer,
            isCorrect,
            score,
            maxScore: 10,
            durationSeconds: 0,
            isMarkedWrong: !isCorrect, // 错题才标记
          },
        ],
      });
    } catch (error) {
      // 新结构写入失败不影响旧接口返回，但记录日志
      console.error('写入新数据结构失败:', error);
    }

    return record;
  }

  /**
   * 获取错题列表
   * 优先从新表 wrong_question 读取，如果没有数据则从旧表兜底
   * 返回结构保持兼容（包含 question、question.category 关系）
   */
  async getWrongQuestions(userId: number) {
    try {
      // 优先从新表读取
      const wrongQuestions = await this.wrongQuestionRepo.find({
        where: { userId, isDeleted: 0 },
        relations: ['question', 'question.category'],
        order: { lastWrongTime: 'DESC' },
      });

      if (wrongQuestions.length > 0) {
        // 转换为兼容旧接口的格式（添加 userAnswer、createdAt 等字段）
        return wrongQuestions.map((wq) => ({
          id: wq.id,
          userId: wq.userId,
          question: wq.question,
          userAnswer: '', // 新表不存单次答案，这里留空或从最近一次 exercise_record_item 取
          isCorrect: false,
          score: 0,
          createdAt: wq.lastWrongTime, // 使用最近错误时间
        }));
      }
    } catch (error) {
      console.error('从新表读取错题失败，回退到旧表:', error);
    }

    // 兜底：从旧表读取
    return this.recordRepo.find({
      where: { userId, isCorrect: false },
      relations: ['question', 'question.category'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取用户统计
   * 优先从新表 exercise_record_item 聚合计算，如果没有数据则从旧表兜底
   */
  async getUserStats(userId: number) {
    try {
      // 优先从新表聚合
      const items = await this.exerciseRecordItemRepo.find({
        where: { userId },
      });

      if (items.length > 0) {
        const total = items.length;
        const correct = items.filter((i) => i.isCorrect).length;
        const totalScore = items.reduce(
          (sum, i) => sum + (i.isCorrect ? i.score : 0),
          0,
        );
        const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : '0.0';

        return {
          totalQuestions: total,
          correctQuestions: correct,
          accuracy: accuracy + '%',
          totalScore,
        };
      }
    } catch (error) {
      console.error('从新表读取统计失败，回退到旧表:', error);
    }

    // 兜底：从旧表计算
    const records = await this.recordRepo.find({
      where: { userId },
    });

    const total = records.length;
    const correct = records.filter((r) => r.isCorrect).length;
    const totalScore = records.reduce(
      (sum, r) => sum + (r.isCorrect ? r.score : 0),
      0,
    );
    const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : '0.0';

    return {
      totalQuestions: total,
      correctQuestions: correct,
      accuracy: accuracy + '%',
      totalScore,
    };
  }

  /**
   * 获取最近做题记录
   * 优先从新表 exercise_record_item 读取，如果没有数据则从旧表兜底
   * 返回结构保持兼容（包含 question、question.category 关系）
   */
  async getRecentRecords(userId: number, limit = 10) {
    try {
      // 优先从新表读取
      const items = await this.exerciseRecordItemRepo.find({
        where: { userId },
        relations: ['question', 'question.category'],
        order: { submitTime: 'DESC' },
        take: limit,
      });

      if (items.length > 0) {
        // 转换为兼容旧接口的格式
        return items.map((item) => ({
          id: item.id,
          userId: item.userId,
          question: item.question,
          userAnswer: item.userAnswer,
          isCorrect: item.isCorrect,
          score: item.score,
          createdAt: item.submitTime || item.createdAt,
        }));
      }
    } catch (error) {
      console.error('从新表读取最近记录失败，回退到旧表:', error);
    }

    // 兜底：从旧表读取
    return this.recordRepo.find({
      where: { userId },
      relations: ['question', 'question.category'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * 获取分类统计
   * 优先从新表 exercise_record_item 聚合，如果没有数据则从旧表兜底
   */
  async getCategoryStats(userId: number) {
    try {
      // 优先从新表聚合
      const items = await this.exerciseRecordItemRepo.find({
        where: { userId },
        relations: ['question', 'question.category'],
      });

      if (items.length > 0) {
        const categoryMap = new Map();
        items.forEach((item) => {
          const categoryName = item.question?.category?.name || '未知分类';
          if (categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, categoryMap.get(categoryName) + 1);
          } else {
            categoryMap.set(categoryName, 1);
          }
        });

        return Array.from(categoryMap.entries()).map(([name, value]) => ({
          name,
          value,
        }));
      }
    } catch (error) {
      console.error('从新表读取分类统计失败，回退到旧表:', error);
    }

    // 兜底：从旧表计算
    const records = await this.recordRepo.find({
      where: { userId },
      relations: ['question', 'question.category'],
    });

    const categoryMap = new Map();
    records.forEach((record) => {
      const categoryName = record.question.category.name;
      if (categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, categoryMap.get(categoryName) + 1);
      } else {
        categoryMap.set(categoryName, 1);
      }
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }

  /**
   * 获取难度统计
   * 优先从新表 exercise_record_item 聚合，如果没有数据则从旧表兜底
   */
  async getDifficultyStats(userId: number) {
    try {
      // 优先从新表聚合
      const items = await this.exerciseRecordItemRepo.find({
        where: { userId },
        relations: ['question'],
      });

      if (items.length > 0) {
        const difficultyMap = new Map();
        items.forEach((item) => {
          const difficulty = item.question?.difficulty || 1;
          const difficultyText =
            difficulty === 1 ? '简单' : difficulty === 2 ? '中等' : '困难';
          if (difficultyMap.has(difficultyText)) {
            difficultyMap.set(
              difficultyText,
              difficultyMap.get(difficultyText) + 1,
            );
          } else {
            difficultyMap.set(difficultyText, 1);
          }
        });

        return Array.from(difficultyMap.entries()).map(([name, value]) => ({
          name,
          value,
        }));
      }
    } catch (error) {
      console.error('从新表读取难度统计失败，回退到旧表:', error);
    }

    // 兜底：从旧表计算
    const records = await this.recordRepo.find({
      where: { userId },
      relations: ['question'],
    });

    const difficultyMap = new Map();
    records.forEach((record) => {
      const difficulty = record.question.difficulty || 1;
      const difficultyText =
        difficulty === 1 ? '简单' : difficulty === 2 ? '中等' : '困难';
      if (difficultyMap.has(difficultyText)) {
        difficultyMap.set(
          difficultyText,
          difficultyMap.get(difficultyText) + 1,
        );
      } else {
        difficultyMap.set(difficultyText, 1);
      }
    });

    return Array.from(difficultyMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }

  /**
   * 获取周趋势统计
   * 优先从新表 exercise_record_item 聚合，如果没有数据则从旧表兜底
   */
  async getWeeklyTrend(userId: number) {
    try {
      // 优先从新表读取
      const items = await this.exerciseRecordItemRepo.find({
        where: { userId },
        order: { submitTime: 'DESC' },
      });

      if (items.length > 0) {
        // 获取最近7天的数据
        const now = new Date();
        const weekData = [];
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dayStart = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
          );
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

          const dayItems = items.filter((item) => {
            const itemDate = new Date(item.submitTime || item.createdAt);
            return itemDate >= dayStart && itemDate < dayEnd;
          });

          const questionCount = dayItems.length;
          const score = dayItems.reduce(
            (sum, item) => sum + (item.isCorrect ? item.score : 0),
            0,
          );

          weekData.push({
            day: days[date.getDay()],
            questions: questionCount,
            score: score,
          });
        }

        return weekData;
      }
    } catch (error) {
      console.error('从新表读取周趋势失败，回退到旧表:', error);
    }

    // 兜底：从旧表计算
    const records = await this.recordRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    // 获取最近7天的数据
    const now = new Date();
    const weekData = [];
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayRecords = records.filter((record) => {
        const recordDate = new Date(record.createdAt);
        return recordDate >= dayStart && recordDate < dayEnd;
      });

      const questionCount = dayRecords.length;
      const score = dayRecords.reduce(
        (sum, record) => sum + (record.isCorrect ? record.score : 0),
        0,
      );

      weekData.push({
        day: days[date.getDay()],
        questions: questionCount,
        score: score,
      });
    }

    return weekData;
  }
}
