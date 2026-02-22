import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppointmentEntity } from "./appointment.entity";
import { AppointmentsService } from "./appointments.service";
import { AppointmentsController } from "./appointments.controller";

@Module({
  imports: [TypeOrmModule.forFeature([AppointmentEntity])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
