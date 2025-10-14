import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { QuizFavoriteService } from './quiz_favorite.service';

@Controller('quiz/favorites')
export class QuizFavoriteController {
  constructor(private readonly service: QuizFavoriteService) {}

  @Post('add')
  addFavorite(@Body() body: { userId: number; questionId: number }) {
    return this.service.addFavorite(body.userId, body.questionId);
  }

  @Delete('remove')
  removeFavorite(@Query('userId') userId: string, @Query('questionId') questionId: string) {
    return this.service.removeFavorite(Number(userId), Number(questionId));
  }

  @Get('list')
  getFavorites(@Query('userId') userId: string) {
    return this.service.getFavorites(Number(userId));
  }

  @Get('check')
  isFavorite(@Query('userId') userId: string, @Query('questionId') questionId: string) {
    return this.service.isFavorite(Number(userId), Number(questionId));
  }
}
