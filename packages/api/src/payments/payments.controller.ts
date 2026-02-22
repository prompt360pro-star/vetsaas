// ============================================================================
// Payments Controller — REST API
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { PaymentsService, CreatePaymentInput } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(@Request() req: any, @Body() body: CreatePaymentInput) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub;
    return this.paymentsService.create(tenantId, userId, body);
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.paymentsService.findAll(req.user?.tenantId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
      method,
      from,
      to,
    });
  }

  @Get('summary')
  async getSummary(@Request() req: any) {
    return this.paymentsService.getSummary(req.user?.tenantId);
  }

  @Get(':id')
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.paymentsService.findById(req.user?.tenantId, id);
  }

  @Post('webhook/:gateway')
  @HttpCode(200)
  async webhook(
    @Param('gateway') gateway: string,
    @Body() payload: Record<string, unknown>,
  ) {
    await this.paymentsService.processWebhook(gateway, payload);
    return { received: true };
  }
}
