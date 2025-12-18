import {
  IsString,
  IsOptional,
  IsArray,
  IsIn,
  IsDateString,
} from 'class-validator';
import { MOOD_TYPES } from '../diary.entity';

/**
 * 更新日记 DTO
 */
export class UpdateDiaryDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsIn(MOOD_TYPES, { message: '情绪必须是 happy/good/neutral/sad/angry 之一' })
  mood?: string;

  @IsOptional()
  @IsDateString({}, { message: '日期格式不正确' })
  diaryDate?: string;

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
