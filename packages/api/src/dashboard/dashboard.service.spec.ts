import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { AnimalEntity } from '../animals/animal.entity';
import { TutorEntity } from '../tutors/tutor.entity';
import { AppointmentEntity } from '../appointments/appointment.entity';
import { PaymentEntity } from '../payments/payment.entity';
import { AuditService } from '../common/audit.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockAnimalsRepo = { count: jest.fn() };
  const mockTutorsRepo = { count: jest.fn() };
  const mockAppointmentsRepo = { count: jest.fn() };
  const mockPaymentsRepo = { find: jest.fn() };
  const mockAuditService = { getRecentActivity: jest.fn() };

  const tenantId = 'tenant-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(AnimalEntity),
          useValue: mockAnimalsRepo,
        },
        { provide: getRepositoryToken(TutorEntity), useValue: mockTutorsRepo },
        {
          provide: getRepositoryToken(AppointmentEntity),
          useValue: mockAppointmentsRepo,
        },
        {
          provide: getRepositoryToken(PaymentEntity),
          useValue: mockPaymentsRepo,
        },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('should return all dashboard KPIs', async () => {
      mockAnimalsRepo.count
        .mockResolvedValueOnce(42) // current total
        .mockResolvedValueOnce(5); // last month new
      mockTutorsRepo.count
        .mockResolvedValueOnce(30) // current total
        .mockResolvedValueOnce(3); // last month new
      mockAppointmentsRepo.count
        .mockResolvedValueOnce(8) // today
        .mockResolvedValueOnce(6); // last month
      mockPaymentsRepo.find
        .mockResolvedValueOnce([{ amount: 50000 }, { amount: 30000 }]) // this month
        .mockResolvedValueOnce([{ amount: 60000 }]); // last month

      const result = await service.getStats(tenantId);

      expect(result.totalAnimals).toBe(42);
      expect(result.totalTutors).toBe(30);
      expect(result.todayAppointments).toBe(8);
      expect(result.monthlyRevenue).toBe(80000);
      expect(result.animalsChange).toBe(37); // 42 - 5
      expect(result.tutorsChange).toBe(27); // 30 - 3
      expect(result.appointmentsChange).toBe(2); // 8 - 6
      expect(result.revenueChange).toBe(33); // ((80000-60000)/60000)*100 = 33.33 → 33
    });

    it('should handle zero last month revenue', async () => {
      mockAnimalsRepo.count.mockResolvedValue(0);
      mockTutorsRepo.count.mockResolvedValue(0);
      mockAppointmentsRepo.count.mockResolvedValue(0);
      mockPaymentsRepo.find.mockResolvedValue([]);

      const result = await service.getStats(tenantId);

      expect(result.revenueChange).toBe(0);
      expect(result.monthlyRevenue).toBe(0);
    });
  });

  describe('getRecentActivity', () => {
    it('should delegate to audit service', async () => {
      const logs = [{ id: 'log-1' }];
      mockAuditService.getRecentActivity.mockResolvedValue(logs);

      const result = await service.getRecentActivity(tenantId);

      expect(mockAuditService.getRecentActivity).toHaveBeenCalledWith(
        tenantId,
        10,
      );
      expect(result).toEqual(logs);
    });
  });
});
