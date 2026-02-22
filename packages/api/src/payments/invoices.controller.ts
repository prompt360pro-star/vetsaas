// ============================================================================
// Invoices Controller — REST API
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Request,
} from "@nestjs/common";
import { InvoicesService, CreateInvoiceInput } from "./invoices.service";

@Controller("invoices")
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async create(@Request() req: any, @Body() body: CreateInvoiceInput) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub;
    return this.invoicesService.create(tenantId, userId, body);
  }

  @Get(":id")
  async findById(@Request() req: any, @Param("id") id: string) {
    return this.invoicesService.findById(req.user?.tenantId, id);
  }

  @Patch(":id/send")
  async send(@Request() req: any, @Param("id") id: string) {
    return this.invoicesService.markAsSent(req.user?.tenantId, id);
  }

  @Patch(":id/pay")
  async markAsPaid(
    @Request() req: any,
    @Param("id") id: string,
  ) {
    return this.invoicesService.markAsPaid(req.user?.tenantId, id);
  }

  @Patch(":id/cancel")
  async cancel(
    @Request() req: any,
    @Param("id") id: string,
    @Body("reason") reason: string,
  ) {
    return this.invoicesService.cancel(req.user?.tenantId, id, reason || "Cancelled by user");
  }
}
