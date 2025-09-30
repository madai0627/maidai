import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CatTypeService } from './cat_type.service';
import { CreateCatTypeDto } from './dto/create-cat_type.dto';

@Controller('cat-type')
export class CatTypeController {
  constructor(private readonly catTypeService: CatTypeService) {}

  @Post('add-cat-type')
  create(@Body() createCatTypeDto: CreateCatTypeDto) {
    return this.catTypeService.create(createCatTypeDto);
  }

  @Get('get-cat-type')
  findAll() {
    return this.catTypeService.findAll();
  }

  @Get('search-cat-type')
  findOne(@Param('id') id: string) {
    return this.catTypeService.findOne(+id);
  }

  @Patch('edit-cat-type')
  update(@Body() { id, ...updateData }: { id: number; [key: string]: any }) {
    return this.catTypeService.update(id, updateData);
  }

  @Delete('delete-cat-type')
  remove(@Param('id') id: string) {
    return this.catTypeService.remove(+id);
  }
}
