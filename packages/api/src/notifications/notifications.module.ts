// ============================================================================
// Notifications Module
// ============================================================================

import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";
import { DeviceTokenEntity } from "./device-token.entity";

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([DeviceTokenEntity])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
