import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizRecord } from './quiz_record.entity';
import { QuizQuestion } from '../quiz_question/quiz_question.entity';

@Injectable()
export class QuizRecordService {
  constructor(
    @InjectRepository(QuizRecord)
    private readonly recordRepo: Repository<QuizRecord>,
    @InjectRepository(QuizQuestion)
    private readonly questionRepo: Repository<QuizQuestion>,
  ) {}

  async submitAnswer(data: {
    userId: number;
    questionId: number;
    userAnswer: string;
    score?: number;
  }) {
    const question = await this.questionRepo.findOneBy({ id: data.questionId });
    if (!question) throw new Error('题目不存在');

    const isCorrect = data.userAnswer === question.correctAnswer;
    const record = this.recordRepo.create({
      userId: data.userId,
      question: question,
      userAnswer: data.userAnswer,
      isCorrect,
      score: data.score || 10,
    });

    return this.recordRepo.save(record);
  }

  async getWrongQuestions(userId: number) {
    return this.recordRepo.find({
      where: { userId, isCorrect: false },
      relations: ['question', 'question.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserStats(userId: number) {
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

  async getRecentRecords(userId: number, limit = 10) {
    return this.recordRepo.find({
      where: { userId },
      relations: ['question', 'question.category'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getCategoryStats(userId: number) {
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

  async getDifficultyStats(userId: number) {
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

  async getWeeklyTrend(userId: number) {
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
