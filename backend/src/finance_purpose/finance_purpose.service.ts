import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancePurpose } from './entities/finance_purpose.entity';
import { CreateFinancePurposeDto } from './dto/create-finance_purpose.dto';
import { UpdateFinancePurposeDto } from './dto/update-finance_purpose.dto';

@Injectable()
export class FinancePurposeService {
  constructor(
    @InjectRepository(FinancePurpose)
    private readonly repo: Repository<FinancePurpose>,
  ) {}

  async create(dto: CreateFinancePurposeDto) {
    const entity = this.repo.create({
      purpose: dto.purpose,
      remark: dto.remark || '',
    });
    await this.repo.save(entity);
    return { code: 0, msg: '添加成功', data: entity };
  }

  async findAll() {
    const list = await this.repo.find({ order: { id: 'DESC' } });
    return { code: 0, msg: 'success', data: list };
  }

  async update(id: number, dto: UpdateFinancePurposeDto) {
    const exists = await this.repo.findOneBy({ id });
    if (!exists) return { code: 404, msg: '用途不存在', data: null };
    await this.repo.update(id, dto);
    const updated = await this.repo.findOneBy({ id });
    return { code: 0, msg: '更新成功', data: updated };
  }

  async remove(id: number) {
    const exists = await this.repo.findOneBy({ id });
    if (!exists) return { code: 404, msg: '用途不存在', data: null };
    await this.repo.delete(id);
    return { code: 0, msg: '删除成功', data: null };
  }
}
