import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Diary } from '../diary/diary.entity';
import { PhotoWall } from '../photo_wall/photo_wall.entity';
import { FinanceRecord } from '../finance_record/entities/finance_record.entity';
import { QuizRecord } from '../quiz_record/quiz_record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Diary, PhotoWall, FinanceRecord, QuizRecord]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
