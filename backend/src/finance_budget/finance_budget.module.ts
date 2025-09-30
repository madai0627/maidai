import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceBudget } from './entities/finance_budget.entity';
import { FinanceBudgetService } from './finance_budget.service';
import { FinanceBudgetController } from './finance_budget.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FinanceBudget])],
  controllers: [FinanceBudgetController],
  providers: [FinanceBudgetService],
})
export class FinanceBudgetModule {}


