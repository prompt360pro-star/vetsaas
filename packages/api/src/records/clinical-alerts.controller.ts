import {
    Controller,
    Get,
    UseGuards,
    Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ClinicalAlertsService } from './clinical-alerts.service';

@Controller('alerts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ClinicalAlertsController {
    constructor(private readonly alertsService: ClinicalAlertsService) { }

    /**
     * GET /alerts — All active clinical alerts for the tenant.
     */
    @Get()
    @Roles('RECEPTIONIST')
    async list(@Req() req: { user: { tenantId: string } }) {
        return this.alertsService.getAlerts(req.user.tenantId);
    }
}
