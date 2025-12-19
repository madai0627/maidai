import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { StudyRecordService } from './study_record.service';

/**
 * 学习记录 & 错题相关接口
 * 注意：这里暂不做登录态解析，仍然通过 userId 参数传入
 * 后续接入用户体系时，可以统一从 Token 中解析 userId
 */
@Controller('study')
export class StudyRecordController {
  constructor(private readonly service: StudyRecordService) {}

  /**
   * 创建一次会话级做题记录
   * 请求体中需包含 userId、items 等信息
   */
  @Post('exercise-records')
  async createExerciseRecord(
    @Body()
    body: {
      userId: number;
      sourceType?: number;
      sourceId?: number;
      subjectCode?: string;
      startTime?: string | Date;
      endTime?: string | Date;
      items: Array<{
        questionId: number;
        userAnswer: string;
        isCorrect: boolean;
        score?: number;
        maxScore?: number;
        durationSeconds?: number;
        isMarkedWrong?: boolean;
      }>;
    },
  ) {
    try {
      return await this.service.createExerciseRecord(body);
    } catch (error) {
      // 简单包装错误信息，避免直接抛出系统错误
      throw new Error(
        `创建做题记录失败：${
          error instanceof Error ? error.message : '未知错误'
        }`,
      );
    }
  }

  /**
   * 分页获取用户做题记录列表（会话级）
   */
  @Get('exercise-records')
  async getExerciseRecords(
    @Query('userId') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.getExerciseRecords({
      userId: Number(userId),
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
  }

  /**
   * 获取单次做题记录详情
   */
  @Get('exercise-records/:id')
  async getExerciseRecordDetail(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    try {
      return await this.service.getExerciseRecordDetail(
        Number(id),
        Number(userId),
      );
    } catch (error) {
      throw new Error(
        `获取做题记录详情失败：${
          error instanceof Error ? error.message : '未知错误'
        }`,
      );
    }
  }

  /**
   * 获取用户错题列表（后续可扩展筛选和分页）
   */
  @Get('wrong-questions')
  async getWrongQuestions(@Query('userId') userId: string) {
    return this.service.getWrongQuestions(Number(userId));
  }

  /**
   * 获取学习概览数据（用于首页）
   */
  @Get('stats/learning-overview')
  async getLearningOverview(
    @Query('userId') userId: string,
    @Query('range') range?: string,
  ) {
    return this.service.getLearningOverview({
      userId: Number(userId),
      range: range || '7d',
    });
  }

  /**
   * 获取详细学习统计数据（用于统计页面）
   */
  @Get('stats/learning-detail')
  async getLearningDetail(
    @Query('userId') userId: string,
    @Query('range') range?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getLearningDetail({
      userId: Number(userId),
      range,
      startDate,
      endDate,
    });
  }
}


