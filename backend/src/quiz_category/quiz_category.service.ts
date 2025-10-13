import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizCategory } from './quiz_category.entity';

@Injectable()
export class QuizCategoryService {
  constructor(
    @InjectRepository(QuizCategory)
    private readonly repo: Repository<QuizCategory>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  create(data: Pick<QuizCategory, 'name'>) {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  update(id: number, data: Partial<QuizCategory>) {
    return this.repo.update(id, data);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}


