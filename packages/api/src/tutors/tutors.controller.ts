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
import { TutorsService } from './tutors.service';
import type { PaginationQuery } from '@vetsaas/shared';

@Controller('tutors')
@UseGuards(AuthGuard('jwt'))
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  @Get()
  async findAll(@Request() req: any, @Query() query: PaginationQuery) {
    const data = await this.tutorsService.findAll(req.user.tenantId, query);
    return { success: true, data };
  }

  @Get(':id')
  async findById(@Request() req: any, @Param('id') id: string) {
    const data = await this.tutorsService.findById(req.user.tenantId, id);
    return { success: true, data };
  }

  @Post()
  async create(@Request() req: any, @Body() body: any) {
    const data = await this.tutorsService.create(
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
    const data = await this.tutorsService.update(req.user.tenantId, id, body);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.tutorsService.remove(req.user.tenantId, id);
    return { success: true, message: 'Tutor removed' };
  }
}
