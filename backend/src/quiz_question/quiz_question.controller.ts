import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuizQuestionService } from './quiz_question.service';

@Controller('quiz/questions')
export class QuizQuestionController {
  constructor(private readonly service: QuizQuestionService) {}

  @Get()
  findAllByCategory(@Query('categoryId') categoryId?: string) {
    const id = categoryId ? Number(categoryId) : undefined;
    return this.service.findAllByCategory(id);
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


