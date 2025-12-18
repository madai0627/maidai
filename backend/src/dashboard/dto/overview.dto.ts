import { IsInt, IsNotEmpty } from 'class-validator';

/**
 * 获取首页概览数据 DTO
 */
export class OverviewDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;
}
