import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyRecordService } from './study_record.service';
import { StudyRecordController } from './study_record.controller';
import { ExerciseRecord } from './entities/exercise_record.entity';
import { ExerciseRecordItem } from './entities/exercise_record_item.entity';
import { WrongQuestion } from './entities/wrong_question.entity';
import { QuizQuestion } from '../quiz_question/quiz_question.entity';

@Module({
  imports: [
    // 只在本模块中注册需要用到的实体
    TypeOrmModule.forFeature([
      ExerciseRecord,
      ExerciseRecordItem,
      WrongQuestion,
      QuizQuestion,
    ]),
  ],
  controllers: [StudyRecordController],
  providers: [StudyRecordService],
  // 导出服务，供其他模块使用
  exports: [StudyRecordService],
})
export class StudyRecordModule {}


