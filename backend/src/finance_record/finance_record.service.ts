import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Like, MoreThanOrEqual, LessThanOrEqual, Repository } from 'typeorm';
import { FinanceRecord } from './entities/finance_record.entity';
import { QueryRecordDto } from './dto/query-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { CreateRecordDto } from './dto/create-record.dto';

@Injectable()
export class FinanceRecordService {
  constructor(
    @InjectRepository(FinanceRecord)
    private readonly repo: Repository<FinanceRecord>,
  ) {}

  async list(q: QueryRecordDto) {
    const page = Number(q.page || 1);
    const pageSize = Number(q.pageSize || 10);
    const where: FindOptionsWhere<FinanceRecord> = {};

    if (q.purpose) where.purpose = Like(`%${q.purpose}%`);
    if (q.category) where.category = Like(`%${q.category}%`);

    if (q.startDate && q.endDate) {
      where.created_at = Between(new Date(q.startDate), new Date(q.endDate));
    } else if (q.startDate) {
      where.created_at = MoreThanOrEqual(new Date(q.startDate));
    } else if (q.endDate) {
      where.created_at = LessThanOrEqual(new Date(q.endDate));
    }

    const order: any = {};
    if (q.sortBy === 'amount') {
      order.amount = q.order === 'ASC' ? 'ASC' : 'DESC';
    } else {
      order.id = 'DESC';
    }

    if (q.minAmount != null || q.maxAmount != null) {
      // amount is decimal string in entity; use query builder for numeric conditions
      const qb = this.repo.createQueryBuilder('r').where(where);
      if (q.minAmount != null) qb.andWhere('CAST(r.amount AS DECIMAL(12,2)) >= :min', { min: q.minAmount });
      if (q.maxAmount != null) qb.andWhere('CAST(r.amount AS DECIMAL(12,2)) <= :max', { max: q.maxAmount });
      qb.orderBy(order);
      const [list, total] = await qb.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
      return { code: 0, msg: 'success', data: { list, total, page, pageSize } };
    }

    const [list, total] = await this.repo.findAndCount({ where, order, skip: (page - 1) * pageSize, take: pageSize });
    return { code: 0, msg: 'success', data: { list, total, page, pageSize } };
  }

  async update(id: number, dto: UpdateRecordDto) {
    const exists = await this.repo.findOneBy({ id });
    if (!exists) return { code: 404, msg: '记录不存在', data: null };
    const updateData: any = { ...dto };
    if (dto.amount !== undefined && dto.amount !== null) {
      updateData.amount = (dto.amount as any)?.toFixed ? (dto.amount as any).toFixed(2) : String(dto.amount);
    }
    await this.repo.update(id, updateData);
    const updated = await this.repo.findOneBy({ id });
    return { code: 0, msg: '更新成功', data: updated };
  }

  async remove(id: number) {
    const exists = await this.repo.findOneBy({ id });
    if (!exists) return { code: 404, msg: '记录不存在', data: null };
    await this.repo.delete(id);
    return { code: 0, msg: '删除成功', data: null };
  }

  async create(dto: CreateRecordDto) {
    const entity = this.repo.create({
      amount: (dto.amount as any)?.toFixed ? (dto.amount as any).toFixed(2) : String(dto.amount),
      category: dto.category,
      purpose: dto.purpose,
      remark: dto.remark || '',
      created_at: dto.created_at || undefined,
    })
    await this.repo.save(entity)
    return { code: 0, msg: '添加成功', data: entity }
  }
}


