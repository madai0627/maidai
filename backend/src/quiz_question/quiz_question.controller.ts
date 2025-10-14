import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuizQuestionService } from './quiz_question.service';

@Controller('quiz/questions')
export class QuizQuestionController {
  constructor(private readonly service: QuizQuestionService) {}

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('categoryId') categoryId?: string,
    @Query('keyword') keyword?: string,
    @Query('difficulty') difficulty?: string
  ) {
    return this.service.findAll({
      page: Number(page),
      pageSize: Number(pageSize),
      categoryId: categoryId ? Number(categoryId) : undefined,
      keyword,
      difficulty: difficulty ? Number(difficulty) : undefined
    });
  }

  @Post()
  create(
    @Body()
    body: {
      content: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctAnswer: 'A' | 'B' | 'C' | 'D';
      categoryId: number;
      difficulty?: number;
    },
  ) {
    return this.service.create(body);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<{ 
      content: string; 
      optionA: string; 
      optionB: string; 
      optionC: string; 
      optionD: string; 
      correctAnswer: 'A' | 'B' | 'C' | 'D'; 
      categoryId: number;
      difficulty?: number;
    }>,
  ) {
    return this.service.update(Number(id), body);
  }

  @Delete('batch')
  async batchRemove(@Body() body: { ids: number[] }) {
    if (!body.ids || !Array.isArray(body.ids)) {
      throw new Error('ids参数必须是数组');
    }
    return this.service.batchRemove(body.ids);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

  @Post('seed-interview')
  seedInterview() {
    return this.service.seedInterview();
  }

  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('请选择要上传的Excel文件');
    }

    if (!file.originalname.endsWith('.xlsx') && !file.originalname.endsWith('.xls')) {
      throw new Error('只支持Excel文件格式(.xlsx, .xls)');
    }

    return this.service.importFromExcel(file.buffer);
  }
}


