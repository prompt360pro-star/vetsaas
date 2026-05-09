// ============================================================================
// Inventory Controller — REST API
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Request,
} from "@nestjs/common";
import {
  InventoryService,
  CreateItemInput,
  StockAdjustInput,
} from "./inventory.service";

@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  async create(@Request() req: any, @Body() body: CreateItemInput) {
    return this.inventoryService.create(
      req.user?.tenantId,
      req.user?.sub,
      body,
    );
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("category") category?: string,
    @Query("search") search?: string,
    @Query("lowStock") lowStock?: string,
  ) {
    return this.inventoryService.findAll(req.user?.tenantId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      category,
      search,
      lowStock: lowStock === "true",
    });
  }

  @Get("alerts")
  async getAlerts(@Request() req: any) {
    const [lowStock, expiring] = await Promise.all([
      this.inventoryService.getLowStockAlerts(req.user?.tenantId),
      this.inventoryService.getExpiringSoon(req.user?.tenantId, 30),
    ]);
    return { lowStock, expiring };
  }

  @Get(":id")
  async findById(@Request() req: any, @Param("id") id: string) {
    return this.inventoryService.findById(req.user?.tenantId, id);
  }

  @Put(":id")
  async update(
    @Request() req: any,
    @Param("id") id: string,
    @Body() body: Partial<CreateItemInput>,
  ) {
    return this.inventoryService.update(req.user?.tenantId, id, body);
  }

  @Post(":id/stock")
  async adjustStock(
    @Request() req: any,
    @Param("id") id: string,
    @Body() body: StockAdjustInput,
  ) {
    return this.inventoryService.adjustStock(
      req.user?.tenantId,
      req.user?.sub,
      id,
      body,
    );
  }

  @Get(":id/movements")
  async getMovements(
    @Request() req: any,
    @Param("id") id: string,
    @Query("limit") limit?: string,
  ) {
    return this.inventoryService.getMovements(
      req.user?.tenantId,
      id,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
