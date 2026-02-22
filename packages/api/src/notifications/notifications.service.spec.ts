// ============================================================================
// Notifications Service — Unit Tests
// ============================================================================

import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import {
  NotificationsService,
  NotificationChannel,
  NotificationTemplate,
} from "./notifications.service";
import * as sgMail from "@sendgrid/mail";

jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest
    .fn()
    .mockResolvedValue([{ headers: { "x-message-id": "mock_msg_id" } }]),
}));

describe("NotificationsService", () => {
  let service: NotificationsService;

  // Helper to setup module with specific config
  const createService = async (configValues: Record<string, any> = {}) => {
    const mockConfigService = {
      get: jest.fn(
        (key: string, defaultValue?: any) => configValues[key] ?? defaultValue,
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  };

  beforeEach(async () => {
    // Default to no API key (stub behavior)
    await createService({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("send", () => {
    it("should send SMS notification successfully", async () => {
      const result = await service.send({
        channel: NotificationChannel.SMS,
        template: NotificationTemplate.APPOINTMENT_REMINDER,
        recipientPhone: "+244 923 456 789",
        recipientName: "João Silva",
        locale: "pt-AO",
        tenantId: "tenant-1",
        data: {
          animalName: "Rex",
          date: "15/03/2025",
          time: "09:00",
          clinicName: "VetAngola",
        },
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.provider).toBe("stub");
    });

    it("should send email notification successfully (fallback stub)", async () => {
      const result = await service.send({
        channel: NotificationChannel.EMAIL,
        template: NotificationTemplate.WELCOME,
        recipientEmail: "joao@email.ao",
        recipientName: "João Silva",
        locale: "pt-AO",
        tenantId: "tenant-1",
        data: { clinicName: "VetAngola", loginUrl: "https://app.vetangola.ao" },
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^email_/);
      expect(result.provider).toBe("stub");
    });

    it("should send email via SendGrid when configured", async () => {
      await createService({
        SENDGRID_API_KEY: "SG.test_key",
        SENDGRID_SENDER_EMAIL: "test@vetangola.ao",
      });

      const result = await service.send({
        channel: NotificationChannel.EMAIL,
        template: NotificationTemplate.WELCOME,
        recipientEmail: "joao@email.ao",
        recipientName: "João Silva",
        locale: "pt-AO",
        tenantId: "tenant-1",
        data: { clinicName: "VetAngola", loginUrl: "https://app.vetangola.ao" },
      });

      expect(sgMail.setApiKey).toHaveBeenCalledWith("SG.test_key");
      expect(sgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "joao@email.ao",
          from: "test@vetangola.ao",
          subject: "Bem-vindo ao VetAngola!",
          customArgs: { tenant_id: "tenant-1" },
        }),
      );
      expect(result.success).toBe(true);
      expect(result.provider).toBe("sendgrid");
      expect(result.messageId).toBe("mock_msg_id");
    });

    it("should return error when SendGrid fails", async () => {
      await createService({ SENDGRID_API_KEY: "SG.test_key" });
      (sgMail.send as jest.Mock).mockRejectedValueOnce(
        new Error("SendGrid Error"),
      );

      const result = await service.send({
        channel: NotificationChannel.EMAIL,
        template: NotificationTemplate.WELCOME,
        recipientEmail: "joao@email.ao",
        recipientName: "João Silva",
        locale: "pt-AO",
        tenantId: "tenant-1",
        data: { clinicName: "VetAngola", loginUrl: "https://app.vetangola.ao" },
      });

      expect(result.success).toBe(false);
      expect(result.provider).toBe("sendgrid");
      expect(result.error).toBe("SendGrid Error");
    });

    it("should send WhatsApp notification successfully", async () => {
      const result = await service.send({
        channel: NotificationChannel.WHATSAPP,
        template: NotificationTemplate.PAYMENT_RECEIVED,
        recipientPhone: "+244 912 345 678",
        recipientName: "Ana Santos",
        locale: "pt-AO",
        tenantId: "tenant-1",
        data: {
          amount: "15.000 Kz",
          description: "Consulta",
          clinicName: "VetAngola",
        },
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^wa_/);
    });

    it("should reject unknown template", async () => {
      const result = await service.send({
        channel: NotificationChannel.SMS,
        template: "NONEXISTENT" as NotificationTemplate,
        recipientPhone: "+244 900 000 000",
        recipientName: "Test",
        locale: "pt-AO",
        tenantId: "tenant-1",
        data: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown template");
    });
  });

  describe("sendAppointmentReminder", () => {
    it("should send appointment reminder via SMS", async () => {
      const result = await service.sendAppointmentReminder(
        "João Silva",
        "+244 923 456 789",
        "Rex",
        "15/03/2025",
        "09:00",
        "VetAngola",
        "tenant-1",
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^sms_/);
    });
  });

  describe("sendVaccineDueAlert", () => {
    it("should send vaccine due alert via SMS", async () => {
      const result = await service.sendVaccineDueAlert(
        "Ana Santos",
        "+244 912 345 678",
        "Mimi",
        "Antirrábica",
        "01/04/2025",
        "VetAngola",
        "tenant-1",
      );

      expect(result.success).toBe(true);
    });
  });
});
