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
    const correct = records.filter(r => r.isCorrect).length;
    const totalScore = records.reduce((sum, r) => sum + (r.isCorrect ? r.score : 0), 0);
    const accuracy = total > 0 ? (correct / total * 100).toFixed(1) : '0.0';

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
}
