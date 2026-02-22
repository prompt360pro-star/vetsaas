import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from './audit.service';

@Controller('audit')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /audit — Paginated audit log with filters.
   * Restricted to CLINIC_ADMIN and above.
   */
  @Get()
  @Roles('CLINIC_ADMIN')
  async list(
    @Req() req: { user: { tenantId: string } },
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findByTenant(req.user.tenantId, {
      entityType,
      action,
      userId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /**
   * GET /audit/:entityType/:entityId — Change history for a specific entity.
   */
  @Get(':entityType/:entityId')
  @Roles('VETERINARIAN')
  async entityHistory(
    @Req() req: { user: { tenantId: string } },
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.findByEntity(
      req.user.tenantId,
      entityType,
      entityId,
    );
  }
}
