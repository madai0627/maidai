import { Injectable } from '@nestjs/common';
import { CreateCatInfoDto } from './dto/create-cat_info.dto';
import { UpdateCatInfoDto } from './dto/update-cat_info.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CatInfo } from './entities/cat_info.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class CatInfoService {
  constructor(
    @InjectRepository(CatInfo)
    private catInfoRepository: Repository<CatInfo>,
    private dataSource: DataSource,
  ) {}

  create(createCatInfoDto: CreateCatInfoDto) {
    return this.catInfoRepository.save(createCatInfoDto);
  }

  findAll() {
    return this.catInfoRepository.query('SELECT * FROM madai.cat_info');
  }

  findOne(id: number) {
    return this.catInfoRepository.findBy({ id });
  }

  update(id: number, updateCatInfoDto: UpdateCatInfoDto) {
    return this.catInfoRepository.update(id, updateCatInfoDto);
  }

  remove(id: number) {
    return this.catInfoRepository.delete(id);
  }
}
