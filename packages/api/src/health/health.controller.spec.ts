import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
    let controller: HealthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
            // Note: No providers needed as the controller does not use dependency injection
        }).compile();

        controller = module.get<HealthController>(HealthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('check', () => {
        it('should return custom health status object', () => {
            // Note: This controller uses a custom health check implementation and does not rely on @nestjs/terminus HealthCheckService.
            const result = controller.check();
            expect(result).toEqual({
                status: 'ok',
                version: '0.1.0',
                uptime: expect.any(Number),
                timestamp: expect.any(String),
            });
        });
    });
});
