import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { MulticaixaGpoService } from "./multicaixa-gpo.service";

describe("MulticaixaGpoService", () => {
  let service: MulticaixaGpoService;

  // Mock fetch
  global.fetch = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MulticaixaGpoService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: any) => {
              if (key === "MULTICAIXA_GPO_API_URL")
                return "http://mock-api.com";
              if (key === "MULTICAIXA_GPO_API_KEY") return "mock-key";
              if (key === "MULTICAIXA_GPO_MERCHANT_ID") return "12345";
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MulticaixaGpoService>(MulticaixaGpoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should generate reference using API", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ reference: "67890" }),
    });

    const result = await service.generateReference(1000);
    expect(result).toBe("1234567890"); // Entity ID + reference
    expect(global.fetch).toHaveBeenCalledWith(
      "http://mock-api.com/references",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          amount: 1000,
          merchantId: "12345",
          currency: "AOA",
        }),
      }),
    );
  });

  it("should fallback if API fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    const result = await service.generateReference(1000);
    // Fallback is entity + 9 digits. Check format.
    expect(result).toMatch(/^12345\d{9}$/);
  });

  it("should fallback if config is missing", async () => {
    // Re-create module with missing config
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MulticaixaGpoService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key, defaultValue) => defaultValue),
          },
        },
      ],
    }).compile();
    const serviceNoConfig =
      module.get<MulticaixaGpoService>(MulticaixaGpoService);

    const result = await serviceNoConfig.generateReference(1000);
    // Fallback uses default merchantId '00000' + 9 digits
    expect(result).toMatch(/^00000\d{9}$/);
  });
});
