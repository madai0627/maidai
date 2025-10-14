import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizFavorite } from './quiz_favorite.entity';
import { QuizFavoriteService } from './quiz_favorite.service';
import { QuizFavoriteController } from './quiz_favorite.controller';
import { QuizQuestion } from '../quiz_question/quiz_question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuizFavorite, QuizQuestion])],
  controllers: [QuizFavoriteController],
  providers: [QuizFavoriteService],
})
export class QuizFavoriteModule {}
