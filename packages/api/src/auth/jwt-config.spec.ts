import { ConfigService } from '@nestjs/config';
import { jwtConfigFactory } from './auth.module';

describe('jwtConfigFactory', () => {
    let configService: ConfigService;

    beforeEach(() => {
        configService = {
            get: jest.fn((key: string, defaultValue?: string) => defaultValue),
        } as any;
    });

    it('should throw an error when JWT_SECRET is not defined', () => {
        expect(() => jwtConfigFactory(configService)).toThrow(
            'JWT_SECRET environment variable is not defined',
        );
        expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    });

    it('should return configured secret when JWT_SECRET is defined', () => {
        (configService.get as jest.Mock).mockImplementation((key: string, defaultValue?: string) => {
            if (key === 'JWT_SECRET') return 'super-secret';
            return defaultValue;
        });

        const config = jwtConfigFactory(configService);
        expect(config.secret).toBe('super-secret');
    });
});
