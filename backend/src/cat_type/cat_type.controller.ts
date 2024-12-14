import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CatTypeService } from './cat_type.service';
import { CreateCatTypeDto } from './dto/create-cat_type.dto';
import { UpdateCatTypeDto } from './dto/update-cat_type.dto';

@Controller('cat-type')
export class CatTypeController {
  constructor(private readonly catTypeService: CatTypeService) {}

  @Post()
  create(@Body() createCatTypeDto: CreateCatTypeDto) {
    return this.catTypeService.create(createCatTypeDto);
  }

  @Get()
  findAll() {
    return this.catTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCatTypeDto: UpdateCatTypeDto) {
    return this.catTypeService.update(+id, updateCatTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catTypeService.remove(+id);
  }
}
