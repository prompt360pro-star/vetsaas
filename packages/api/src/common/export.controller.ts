import { Controller, Get, Query, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ExportService } from './export.service';

@Controller('export')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('CLINIC_ADMIN')
export class ExportController {
    constructor(private readonly exportService: ExportService) {}

    @Get('animals')
    async exportAnimals(@Request() req: any, @Res() res: Response) {
        const csv = await this.exportService.exportAnimals(req.user.tenantId);
        this.sendCsv(res, csv, 'pacientes');
    }

    @Get('payments')
    async exportPayments(
        @Request() req: any,
        @Res() res: Response,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const csv = await this.exportService.exportPayments(
            req.user.tenantId,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );
        this.sendCsv(res, csv, 'pagamentos');
    }

    @Get('audit')
    async exportAudit(@Request() req: any, @Res() res: Response, @Query('limit') limit?: string) {
        const csv = await this.exportService.exportAudit(req.user.tenantId, limit ? parseInt(limit, 10) : 500);
        this.sendCsv(res, csv, 'auditoria');
    }

    private sendCsv(res: Response, csv: string, name: string) {
        const date = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${name}_${date}.csv"`);
        // BOM for Excel UTF-8 compatibility
        res.send('\uFEFF' + csv);
    }
}
