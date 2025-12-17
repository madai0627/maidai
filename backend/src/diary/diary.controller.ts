import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { DiaryService } from './diary.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { ListDiaryDto, MoodStatsDto, CalendarDto } from './dto/list-diary.dto';

@Controller('diary')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  /**
   * 创建日记
   * POST /api/diary/create
   */
  @Post('create')
  create(@Body() dto: CreateDiaryDto) {
    return this.diaryService.create(dto);
  }

  /**
   * 获取日记列表
   * GET /api/diary/list
   */
  @Get('list')
  list(@Query() dto: ListDiaryDto) {
    return this.diaryService.list(dto);
  }

  /**
   * 情绪统计
   * GET /api/diary/stats/mood
   */
  @Get('stats/mood')
  getMoodStats(@Query() dto: MoodStatsDto) {
    return this.diaryService.getMoodStats(dto);
  }

  /**
   * 日历数据
   * GET /api/diary/calendar
   */
  @Get('calendar')
  getCalendarData(@Query() dto: CalendarDto) {
    return this.diaryService.getCalendarData(dto);
  }

  /**
   * 获取连续记录天数
   * GET /api/diary/streak
   */
  @Get('streak')
  getStreakDays(@Query('userId', ParseIntPipe) userId: number) {
    return this.diaryService.getStreakDays(userId);
  }

  /**
   * 获取日记详情
   * GET /api/diary/:id
   */
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.diaryService.findOne(id, userId);
  }

  /**
   * 更新日记
   * PUT /api/diary/:id
   */
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateDiaryDto,
  ) {
    return this.diaryService.update(id, userId, dto);
  }

  /**
   * 删除日记（软删除）
   * DELETE /api/diary/:id
   */
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.diaryService.remove(id, userId);
  }
}

