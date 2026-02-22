import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { NotificationsService } from "./notifications.service";
import { TwilioSmsProvider } from "./sms/twilio-sms.provider";
import { GenericSmsProvider } from "./sms/generic-sms.provider";

describe("NotificationsService Provider Selection", () => {
  it("should use TwilioSmsProvider when configured", async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: any) => {
              if (key === "SMS_PROVIDER") return "twilio";
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    const service = module.get<NotificationsService>(NotificationsService);
    // access private property for testing purposes (casting to any)
    const provider = (service as any).smsProvider;
    expect(provider).toBeInstanceOf(TwilioSmsProvider);
  });

  it("should use GenericSmsProvider when configured", async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: any) => {
              if (key === "SMS_PROVIDER") return "generic";
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    const service = module.get<NotificationsService>(NotificationsService);
    const provider = (service as any).smsProvider;
    expect(provider).toBeInstanceOf(GenericSmsProvider);
  });

  it("should use Stub when configured with stub", async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: any) => {
              if (key === "SMS_PROVIDER") return "stub";
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    const service = module.get<NotificationsService>(NotificationsService);
    const provider = (service as any).smsProvider;
    expect(provider).not.toBeInstanceOf(TwilioSmsProvider);
    expect(provider).not.toBeInstanceOf(GenericSmsProvider);
    expect(provider.send).toBeDefined();
  });
});
