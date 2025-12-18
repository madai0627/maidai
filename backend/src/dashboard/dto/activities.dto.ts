import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

/**
 * 获取最近动态 DTO
 */
export class ActivitiesDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  limit?: number = 10;
}
