import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalEntity } from '../animals/animal.entity';
import { TutorEntity } from '../tutors/tutor.entity';
import { AppointmentEntity } from '../appointments/appointment.entity';
import { PaymentEntity } from '../payments/payment.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
    imports: [TypeOrmModule.forFeature([AnimalEntity, TutorEntity, AppointmentEntity, PaymentEntity])],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}
