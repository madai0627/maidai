import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diary } from './diary.entity';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Diary])],
  providers: [DiaryService],
  controllers: [DiaryController],
  exports: [DiaryService], // 导出供其他模块使用
})
export class DiaryModule {}

