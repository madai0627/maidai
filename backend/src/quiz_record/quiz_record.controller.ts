import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { QuizRecordService } from './quiz_record.service';

@Controller('quiz/records')
export class QuizRecordController {
  constructor(private readonly service: QuizRecordService) {}

  @Post('submit')
  submitAnswer(
    @Body()
    body: {
      userId: number;
      questionId: number;
      userAnswer: string;
      score?: number;
    },
  ) {
    return this.service.submitAnswer(body);
  }

  @Get('wrong')
  getWrongQuestions(@Query('userId') userId: string) {
    return this.service.getWrongQuestions(Number(userId));
  }

  @Get('stats')
  getUserStats(@Query('userId') userId: string) {
    return this.service.getUserStats(Number(userId));
  }

  @Get('recent')
  getRecentRecords(
    @Query('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getRecentRecords(
      Number(userId),
      limit ? Number(limit) : 10,
    );
  }

  @Get('category-stats')
  getCategoryStats(@Query('userId') userId: string) {
    return this.service.getCategoryStats(Number(userId));
  }

  @Get('difficulty-stats')
  getDifficultyStats(@Query('userId') userId: string) {
    return this.service.getDifficultyStats(Number(userId));
  }

  @Get('weekly-trend')
  getWeeklyTrend(@Query('userId') userId: string) {
    return this.service.getWeeklyTrend(Number(userId));
  }
}
