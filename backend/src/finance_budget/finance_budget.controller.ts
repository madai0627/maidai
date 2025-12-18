import { Body, Controller, Get, Post } from '@nestjs/common';
import { FinanceBudgetService } from './finance_budget.service';
import { CreateFinanceBudgetDto } from './dto/create-finance_budget.dto';

@Controller('finance-budget')
export class FinanceBudgetController {
  constructor(private readonly service: FinanceBudgetService) {}

  @Get('list')
  list() {
    return this.service.list();
  }

  @Post('add')
  add(@Body() dto: CreateFinanceBudgetDto) {
    return this.service.create(dto);
  }
}
