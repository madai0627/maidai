import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { OverviewDto } from './dto/overview.dto';
import { ActivitiesDto } from './dto/activities.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * 获取首页概览数据
   * GET /api/dashboard/overview
   */
  @Get('overview')
  getOverview(@Query('userId', ParseIntPipe) userId: number) {
    const dto: OverviewDto = { userId };
    return this.dashboardService.getOverview(dto);
  }

  /**
   * 获取最近动态
   * GET /api/dashboard/activities
   */
  @Get('activities')
  getActivities(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('limit') limit?: number,
  ) {
    const dto: ActivitiesDto = {
      userId,
      limit: limit ? parseInt(String(limit)) : 10,
    };
    return this.dashboardService.getActivities(dto);
  }
}
