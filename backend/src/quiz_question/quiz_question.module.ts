import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizQuestion } from './quiz_question.entity';
import { QuizQuestionService } from './quiz_question.service';
import { QuizQuestionController } from './quiz_question.controller';
import { QuizCategory } from '../quiz_category/quiz_category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuizQuestion, QuizCategory])],
  controllers: [QuizQuestionController],
  providers: [QuizQuestionService],
})
export class QuizQuestionModule {}


