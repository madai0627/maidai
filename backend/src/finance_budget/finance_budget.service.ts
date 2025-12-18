import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinanceBudget } from './entities/finance_budget.entity';
import { CreateFinanceBudgetDto } from './dto/create-finance_budget.dto';

@Injectable()
export class FinanceBudgetService {
  constructor(
    @InjectRepository(FinanceBudget)
    private readonly repo: Repository<FinanceBudget>,
  ) {}

  async list() {
    const list = await this.repo.find({ order: { id: 'DESC' } });
    return { code: 0, msg: 'success', data: list };
  }

  async create(dto: CreateFinanceBudgetDto) {
    const entity = this.repo.create({
      amount: (dto.amount as any)?.toFixed
        ? (dto.amount as any).toFixed(2)
        : String(dto.amount),
    });
    await this.repo.save(entity);
    return { code: 0, msg: '添加成功', data: entity };
  }
}
