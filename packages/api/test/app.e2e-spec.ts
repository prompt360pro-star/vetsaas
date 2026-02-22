// ============================================================================
// App E2E Test — Health & Bootstrap
// ============================================================================

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

/**
 * Basic E2E smoke test scaffold.
 *
 * To run against a real database + Redis you need:
 *   - docker-compose up -d (PostgreSQL, Redis)
 *   - pnpm --filter @vetsaas/api test:e2e
 *
 * In CI, these services are provided via GitHub Actions service containers.
 */
describe('App (e2e)', () => {
    let app: INestApplication;

    // Skip if no DB is available (CI will set DATABASE_HOST)
    const shouldRun = process.env.DATABASE_HOST || process.env.CI;

    beforeAll(async () => {
        if (!shouldRun) return;

        // Lazy-import to avoid compilation if we skip
        const { AppModule } = await import('../src/app.module');

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        if (app) await app.close();
    });

    it('should bootstrap the application', () => {
        if (!shouldRun) {
            console.log(
                '⏭  E2E tests skipped — no database available. Run docker-compose up first.',
            );
            return;
        }
        expect(app).toBeDefined();
    });

    it.skip('GET /api/health should return 200', async () => {
        // Uncomment when a health endpoint is added
        // const response = await request(app.getHttpServer()).get('/api/health');
        // expect(response.status).toBe(200);
    });
});
