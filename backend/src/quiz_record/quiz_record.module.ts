import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizRecord } from './quiz_record.entity';
import { QuizRecordService } from './quiz_record.service';
import { QuizRecordController } from './quiz_record.controller';
import { QuizQuestion } from '../quiz_question/quiz_question.entity';
// 导入新数据结构实体，用于迁移
import { ExerciseRecord } from '../study_record/entities/exercise_record.entity';
import { ExerciseRecordItem } from '../study_record/entities/exercise_record_item.entity';
import { WrongQuestion } from '../study_record/entities/wrong_question.entity';
// 导入新服务模块
import { StudyRecordModule } from '../study_record/study_record.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuizRecord,
      QuizQuestion,
      // 新数据结构实体
      ExerciseRecord,
      ExerciseRecordItem,
      WrongQuestion,
    ]),
    // 导入新服务模块，以便使用 StudyRecordService
    StudyRecordModule,
  ],
  controllers: [QuizRecordController],
  providers: [QuizRecordService],
})
export class QuizRecordModule {}
