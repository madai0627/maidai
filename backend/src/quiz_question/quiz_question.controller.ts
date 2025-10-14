import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { QuizQuestionService } from './quiz_question.service';

@Controller('quiz/questions')
export class QuizQuestionController {
  constructor(private readonly service: QuizQuestionService) {}

  @Get()
  findAllByCategory(@Query('categoryId') categoryId: string) {
    return this.service.findAllByCategory(Number(categoryId));
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
}


