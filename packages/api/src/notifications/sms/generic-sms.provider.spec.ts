import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { GenericSmsProvider } from "./generic-sms.provider";

// Mock ConfigService
const mockConfigService = {
  get: jest.fn((key: string, defaultValue: any) => {
    switch (key) {
      case "SMS_GENERIC_URL":
        return "https://api.example.com/sms";
      case "SMS_GENERIC_METHOD":
        return "POST";
      case "SMS_GENERIC_HEADERS":
        return '{"Authorization": "Bearer key"}';
      case "SMS_GENERIC_BODY_TEMPLATE":
        return '{"to": "{{phone}}", "message": "{{body}}"}';
      default:
        return defaultValue;
    }
  }),
};

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve("Success"),
  }),
) as any;

describe("GenericSmsProvider", () => {
  let provider: GenericSmsProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenericSmsProvider,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    provider = module.get<GenericSmsProvider>(GenericSmsProvider);
  });

  it("should be defined", () => {
    expect(provider).toBeDefined();
  });

  it("should send an SMS successfully with template replacement", async () => {
    const result = await provider.send(
      "+1234567890",
      "Hello Generic",
      "tenant-1",
    );
    expect(result.success).toBe(true);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/sms",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer key",
        }),
        body: '{"to": "+1234567890", "message": "Hello Generic"}',
      }),
    );
  });
});
