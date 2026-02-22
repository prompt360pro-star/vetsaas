import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AnimalEntity } from '../animals/animal.entity';
import { TutorEntity } from '../tutors/tutor.entity';
import { AppointmentEntity } from '../appointments/appointment.entity';
import { PaymentEntity } from '../payments/payment.entity';
import { AuditService } from '../common/audit.service';

export interface DashboardStats {
    totalAnimals: number;
    totalTutors: number;
    todayAppointments: number;
    monthlyRevenue: number;
    animalsChange: number; // vs last month
    tutorsChange: number;
    appointmentsChange: number;
    revenueChange: number;
}

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(AnimalEntity)
        private readonly animalsRepo: Repository<AnimalEntity>,
        @InjectRepository(TutorEntity)
        private readonly tutorsRepo: Repository<TutorEntity>,
        @InjectRepository(AppointmentEntity)
        private readonly appointmentsRepo: Repository<AppointmentEntity>,
        @InjectRepository(PaymentEntity)
        private readonly paymentsRepo: Repository<PaymentEntity>,
        private readonly auditService: AuditService,
    ) {}

    /**
     * Get dashboard statistics for a tenant.
     */
    async getStats(tenantId: string): Promise<DashboardStats> {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 86400000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // Current counts
        const [totalAnimals, totalTutors, todayAppointments] = await Promise.all([
            this.animalsRepo.count({ where: { tenantId } }),
            this.tutorsRepo.count({ where: { tenantId } }),
            this.appointmentsRepo.count({
                where: {
                    tenantId,
                    scheduledAt: Between(startOfDay, endOfDay),
                },
            }),
        ]);

        // Monthly revenue
        const paymentsThisMonth = await this.paymentsRepo.find({
            where: {
                tenantId,
                status: 'COMPLETED',
                paidAt: Between(startOfMonth, now),
            },
        });
        const monthlyRevenue = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);

        // Last month comparisons
        const [lastMonthAnimals, lastMonthTutors, lastMonthAppointments] = await Promise.all([
            this.animalsRepo.count({
                where: {
                    tenantId,
                    createdAt: Between(startOfLastMonth, endOfLastMonth),
                },
            }),
            this.tutorsRepo.count({
                where: {
                    tenantId,
                    createdAt: Between(startOfLastMonth, endOfLastMonth),
                },
            }),
            this.appointmentsRepo.count({
                where: {
                    tenantId,
                    scheduledAt: Between(startOfLastMonth, endOfLastMonth),
                },
            }),
        ]);

        const paymentsLastMonth = await this.paymentsRepo.find({
            where: {
                tenantId,
                status: 'COMPLETED',
                paidAt: Between(startOfLastMonth, endOfLastMonth),
            },
        });
        const lastMonthRevenue = paymentsLastMonth.reduce((sum, p) => sum + p.amount, 0);

        return {
            totalAnimals,
            totalTutors,
            todayAppointments,
            monthlyRevenue,
            animalsChange: totalAnimals - lastMonthAnimals,
            tutorsChange: totalTutors - lastMonthTutors,
            appointmentsChange: todayAppointments - lastMonthAppointments,
            revenueChange:
                lastMonthRevenue > 0 ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0,
        };
    }

    /**
     * Get recent activity for the dashboard.
     */
    async getRecentActivity(tenantId: string) {
        return this.auditService.getRecentActivity(tenantId, 10);
    }
}
