import { Controller, Get, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TemplatesService } from './templates.service';

@Controller('records/templates')
@UseGuards(AuthGuard('jwt'))
export class TemplatesController {
    constructor(private readonly templatesService: TemplatesService) {}

    /**
     * GET /records/templates — List all SOAP templates.
     */
    @Get()
    list() {
        return this.templatesService.getAll();
    }

    /**
     * GET /records/templates/:id — Get a single template.
     */
    @Get(':id')
    findOne(@Param('id') id: string) {
        const template = this.templatesService.getById(id);
        if (!template) {
            throw new NotFoundException(`Template '${id}' not found`);
        }
        return template;
    }
}
