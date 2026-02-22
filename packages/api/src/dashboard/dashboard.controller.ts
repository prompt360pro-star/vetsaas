import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/stats — KPIs for the dashboard.
   */
  @Get('stats')
  @Roles('RECEPTIONIST')
  async stats(@Req() req: { user: { tenantId: string } }) {
    return this.dashboardService.getStats(req.user.tenantId);
  }

  /**
   * GET /dashboard/activity — Recent activity feed.
   */
  @Get('activity')
  @Roles('RECEPTIONIST')
  async activity(@Req() req: { user: { tenantId: string } }) {
    return this.dashboardService.getRecentActivity(req.user.tenantId);
  }
}
