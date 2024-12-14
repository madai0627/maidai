import { Injectable } from '@nestjs/common';
import { CreateCatTypeDto } from './dto/create-cat_type.dto';
import { UpdateCatTypeDto } from './dto/update-cat_type.dto';

@Injectable()
export class CatTypeService {
  create(createCatTypeDto: CreateCatTypeDto) {
    return 'This action adds a new catType';
  }

  findAll() {
    return `This action returns all catType`;
  }

  findOne(id: number) {
    return `This action returns a #${id} catType`;
  }

  update(id: number, updateCatTypeDto: UpdateCatTypeDto) {
    return `This action updates a #${id} catType`;
  }

  remove(id: number) {
    return `This action removes a #${id} catType`;
  }
}
