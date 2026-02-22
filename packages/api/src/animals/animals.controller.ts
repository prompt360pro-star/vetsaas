import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnimalsService } from './animals.service';
import type { PaginationQuery } from '@vetsaas/shared';

@Controller('animals')
@UseGuards(AuthGuard('jwt'))
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Get()
  async findAll(@Request() req: any, @Query() query: PaginationQuery) {
    const data = await this.animalsService.findAll(req.user.tenantId, query);
    return { success: true, data };
  }

  @Get(':id')
  async findById(@Request() req: any, @Param('id') id: string) {
    const data = await this.animalsService.findById(req.user.tenantId, id);
    return { success: true, data };
  }

  @Post()
  async create(@Request() req: any, @Body() body: any) {
    const data = await this.animalsService.create(
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
    const data = await this.animalsService.update(req.user.tenantId, id, body);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.animalsService.remove(req.user.tenantId, id);
    return { success: true, message: 'Animal removed' };
  }
}
