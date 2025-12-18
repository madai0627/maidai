import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizFavorite } from './quiz_favorite.entity';
import { QuizQuestion } from '../quiz_question/quiz_question.entity';

@Injectable()
export class QuizFavoriteService {
  constructor(
    @InjectRepository(QuizFavorite)
    private readonly favoriteRepo: Repository<QuizFavorite>,
    @InjectRepository(QuizQuestion)
    private readonly questionRepo: Repository<QuizQuestion>,
  ) {}

  async addFavorite(userId: number, questionId: number) {
    // 检查是否已收藏
    const existing = await this.favoriteRepo.findOne({
      where: { userId, question: { id: questionId } },
    });

    if (existing) {
      return { message: '已收藏过该题目' };
    }

    const question = await this.questionRepo.findOneBy({ id: questionId });
    if (!question) throw new Error('题目不存在');

    const favorite = this.favoriteRepo.create({
      userId,
      question,
    });

    return this.favoriteRepo.save(favorite);
  }

  async removeFavorite(userId: number, questionId: number) {
    const result = await this.favoriteRepo.delete({
      userId,
      question: { id: questionId },
    });

    return { deleted: result.affected > 0 };
  }

  async getFavorites(userId: number) {
    return this.favoriteRepo.find({
      where: { userId },
      relations: ['question', 'question.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async isFavorite(userId: number, questionId: number) {
    const favorite = await this.favoriteRepo.findOne({
      where: { userId, question: { id: questionId } },
    });
    return !!favorite;
  }
}
