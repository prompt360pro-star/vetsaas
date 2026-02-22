import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RecordsService } from './records.service';
import type { PaginationQuery } from '@vetsaas/shared';

@Controller('records')
@UseGuards(AuthGuard('jwt'))
export class RecordsController {
    constructor(private readonly recordsService: RecordsService) {}

    @Get('animal/:animalId')
    async findByAnimal(
        @Request() req: any,
        @Param('animalId') animalId: string,
        @Query() query: PaginationQuery,
    ) {
        const data = await this.recordsService.findByAnimal(
            req.user.tenantId,
            animalId,
            query,
        );
        return { success: true, data };
    }

    @Get(':id')
    async findById(@Request() req: any, @Param('id') id: string) {
        const data = await this.recordsService.findById(req.user.tenantId, id);
        return { success: true, data };
    }

    @Post()
    async create(@Request() req: any, @Body() body: any) {
        const data = await this.recordsService.create(
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
        const data = await this.recordsService.update(
            req.user.tenantId,
            id,
            body,
        );
        return { success: true, data };
    }

    @Post(':id/sign')
    async sign(@Request() req: any, @Param('id') id: string) {
        const data = await this.recordsService.sign(
            req.user.tenantId,
            id,
            req.user.sub,
        );
        return { success: true, data };
    }
}
