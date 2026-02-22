import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import type { PaginationQuery } from '@vetsaas/shared';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'))
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) {}

    @Get()
    async findAll(
        @Request() req: any,
        @Query()
        query: PaginationQuery & { date?: string; veterinarianId?: string },
    ) {
        const data = await this.appointmentsService.findAll(
            req.user.tenantId,
            query,
        );
        return { success: true, data };
    }

    @Get(':id')
    async findById(@Request() req: any, @Param('id') id: string) {
        const data = await this.appointmentsService.findById(
            req.user.tenantId,
            id,
        );
        return { success: true, data };
    }

    @Post()
    async create(@Request() req: any, @Body() body: any) {
        const data = await this.appointmentsService.create(
            req.user.tenantId,
            req.user.sub,
            body,
        );
        return { success: true, data };
    }

    @Put(':id')
    async update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() body: any,
    ) {
        const data = await this.appointmentsService.update(
            req.user.tenantId,
            id,
            body,
        );
        return { success: true, data };
    }

    @Patch(':id/status')
    async updateStatus(
        @Request() req: any,
        @Param('id') id: string,
        @Body('status') status: string,
    ) {
        const data = await this.appointmentsService.updateStatus(
            req.user.tenantId,
            id,
            status,
        );
        return { success: true, data };
    }
}
