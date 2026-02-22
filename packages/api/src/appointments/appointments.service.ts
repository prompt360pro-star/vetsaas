import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AppointmentEntity } from './appointment.entity';
import type { PaginatedResponse, PaginationQuery } from '@vetsaas/shared';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(AppointmentEntity)
    private readonly repo: Repository<AppointmentEntity>,
  ) {}

  async findAll(
    tenantId: string,
    query: PaginationQuery & { date?: string; veterinarianId?: string },
  ): Promise<PaginatedResponse<AppointmentEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (query.veterinarianId) {
      where.veterinarianId = query.veterinarianId;
    }
    if (query.date) {
      const start = new Date(query.date);
      const end = new Date(query.date);
      end.setDate(end.getDate() + 1);
      where.scheduledAt = Between(start, end);
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      skip,
      take: limit,
      order: { scheduledAt: 'ASC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<AppointmentEntity> {
    const appointment = await this.repo.findOne({ where: { id, tenantId } });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  async create(
    tenantId: string,
    userId: string,
    data: Partial<AppointmentEntity>,
  ): Promise<AppointmentEntity> {
    const appointment = this.repo.create({
      ...data,
      tenantId,
      createdBy: userId,
    });
    return this.repo.save(appointment);
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: string,
  ): Promise<AppointmentEntity> {
    const appointment = await this.findById(tenantId, id);
    appointment.status = status;

    // Track status change timestamps
    const now = new Date();
    switch (status) {
      case 'CHECKED_IN':
        appointment.checkedInAt = now;
        break;
      case 'IN_PROGRESS':
        appointment.startedAt = now;
        break;
      case 'COMPLETED':
        appointment.completedAt = now;
        break;
      case 'CANCELLED':
        appointment.cancelledAt = now;
        break;
    }

    return this.repo.save(appointment);
  }

  async update(
    tenantId: string,
    id: string,
    data: Partial<AppointmentEntity>,
  ): Promise<AppointmentEntity> {
    const appointment = await this.findById(tenantId, id);
    Object.assign(appointment, data);
    return this.repo.save(appointment);
  }

  async todayCount(tenantId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.repo.count({
      where: {
        tenantId,
        scheduledAt: Between(today, tomorrow),
      },
    });
  }
}
