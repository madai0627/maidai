import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhotoWall } from './photo_wall.entity';

@Injectable()
export class PhotoWallService {
  constructor(
    @InjectRepository(PhotoWall)
    private readonly repo: Repository<PhotoWall>,
  ) {}

  async list(params?: { lastId?: number; limit?: number }) {
    const qb = this.repo.createQueryBuilder('p').orderBy('p.id', 'DESC');
    if (params?.lastId) qb.where('p.id < :lastId', { lastId: params.lastId });
    const take = Math.min(Math.max(params?.limit || 20, 1), 100);
    qb.take(take);
    const list = await qb.getMany();
    return { code: 0, msg: 'success', data: list };
  }

  async create(data: { image: string; description?: string }) {
    const entity = this.repo.create({
      image: data.image,
      description: data.description || '',
    });
    await this.repo.save(entity);
    return { code: 0, msg: '添加成功', data: entity };
  }

  async update(
    id: number,
    data: Partial<{ image: string; description: string }>,
  ) {
    const exists = await this.repo.findOneBy({ id });
    if (!exists) return { code: 404, msg: '记录不存在', data: null };
    await this.repo.update(id, data);
    const updated = await this.repo.findOneBy({ id });
    return { code: 0, msg: '更新成功', data: updated };
  }

  async remove(id: number) {
    const exists = await this.repo.findOneBy({ id });
    if (!exists) return { code: 404, msg: '记录不存在', data: null };
    await this.repo.delete(id);
    return { code: 0, msg: '删除成功', data: null };
  }
}
