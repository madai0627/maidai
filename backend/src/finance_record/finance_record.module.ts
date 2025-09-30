import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceRecord } from './entities/finance_record.entity';
import { FinanceRecordService } from './finance_record.service';
import { FinanceRecordController } from './finance_record.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FinanceRecord])],
  controllers: [FinanceRecordController],
  providers: [FinanceRecordService],
})
export class FinanceRecordModule {}


