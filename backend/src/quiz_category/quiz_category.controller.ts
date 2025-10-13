import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { QuizCategoryService } from './quiz_category.service';

@Controller('quiz/categories')
export class QuizCategoryController {
  constructor(private readonly service: QuizCategoryService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() body: { name: string }) {
    return this.service.create({ name: body.name });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name?: string }) {
    return this.service.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}


