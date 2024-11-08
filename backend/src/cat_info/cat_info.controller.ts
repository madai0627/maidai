import { Controller, Get, Post, Body, Patch, Param, Delete,Query  } from '@nestjs/common';
import { CatInfoService } from './cat_info.service';
import { CreateCatInfoDto } from './dto/create-cat_info.dto';
import { UpdateCatInfoDto } from './dto/update-cat_info.dto';

@Controller('cat-info')
export class CatInfoController {
  constructor(private readonly catInfoService: CatInfoService) {}

  @Post('save-cat')
  create(@Body() createCatInfoDto: CreateCatInfoDto) {
    return this.catInfoService.create(createCatInfoDto);
  }

  @Get('get-cat')
  findAll() {
    return this.catInfoService.findAll();
  }

  @Get('search-cat')
  findOne(@Query('id') id: number) {
    
    return this.catInfoService.findOne(+id);
  }

  @Patch('update-cat')
  update(@Query('id') id: number, @Body() updateCatInfoDto: UpdateCatInfoDto) {
    return this.catInfoService.update(+id, updateCatInfoDto);
  }

  @Delete('remove-cat')
  remove(@Query('id') id: number) {
    return this.catInfoService.remove(+id);
  }
}
