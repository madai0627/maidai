import { IsString, IsNotEmpty, IsOptional, IsArray, IsIn, IsDateString } from 'class-validator';
import { MOOD_TYPES } from '../diary.entity';

/**
 * 创建日记 DTO
 */
export class CreateDiaryDto {
  @IsNotEmpty({ message: '用户ID不能为空' })
  userId: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsNotEmpty({ message: '情绪不能为空' })
  @IsIn(MOOD_TYPES, { message: '情绪必须是 happy/good/neutral/sad/angry 之一' })
  mood: string;

  @IsNotEmpty({ message: '日期不能为空' })
  @IsDateString({}, { message: '日期格式不正确' })
  diaryDate: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  weather?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

