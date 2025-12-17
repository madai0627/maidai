import { IsOptional, IsIn, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { MOOD_TYPES } from '../diary.entity';

/**
 * 日记列表查询 DTO
 */
export class ListDiaryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;

  @IsOptional()
  @IsIn([...MOOD_TYPES], { message: '情绪必须是 happy/good/neutral/sad/angry 之一' })
  mood?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}

/**
 * 情绪统计查询 DTO
 */
export class MoodStatsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsString()
  month?: string; // 格式: YYYY-MM
}

/**
 * 日历数据查询 DTO
 */
export class CalendarDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsString()
  month?: string; // 格式: YYYY-MM
}

