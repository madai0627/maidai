import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizRecord } from './quiz_record.entity';
import { QuizRecordService } from './quiz_record.service';
import { QuizRecordController } from './quiz_record.controller';
import { QuizQuestion } from '../quiz_question/quiz_question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuizRecord, QuizQuestion])],
  controllers: [QuizRecordController],
  providers: [QuizRecordService],
})
export class QuizRecordModule {}
