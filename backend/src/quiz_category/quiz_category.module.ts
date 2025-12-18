import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizCategory } from './quiz_category.entity';
import { QuizCategoryService } from './quiz_category.service';
import { QuizCategoryController } from './quiz_category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([QuizCategory])],
  controllers: [QuizCategoryController],
  providers: [QuizCategoryService],
})
export class QuizCategoryModule {}
