import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TwilioSmsProvider } from './twilio-sms.provider';

// Mock ConfigService
const mockConfigService = {
  get: jest.fn((key: string) => {
    switch (key) {
      case 'TWILIO_ACCOUNT_SID':
        return 'ACtest';
      case 'TWILIO_AUTH_TOKEN':
        return 'auth_token';
      case 'TWILIO_FROM_NUMBER':
        return '+1234567890';
      default:
        return null;
    }
  }),
};

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ sid: 'SMtest' }),
    text: () => Promise.resolve(''),
  }),
) as any;

describe('TwilioSmsProvider', () => {
  let provider: TwilioSmsProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwilioSmsProvider,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    provider = module.get<TwilioSmsProvider>(TwilioSmsProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should send an SMS successfully', async () => {
    const result = await provider.send('+1987654321', 'Hello World', 'tenant-1');
    expect(result.success).toBe(true);
    expect(result.messageId).toBe('SMtest');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.twilio.com/2010-04-01/Accounts/ACtest/Messages.json'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Basic'),
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
        body: expect.stringContaining('To=%2B1987654321&From=%2B1234567890&Body=Hello+World'),
      }),
    );
  });

  it('should handle failure', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () => Promise.resolve('Error message'),
      }),
    );

    const result = await provider.send('+1987654321', 'Hello World', 'tenant-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Twilio API error: Bad Request');
  });
});
