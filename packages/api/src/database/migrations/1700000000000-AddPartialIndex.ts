import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPartialIndex1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE INDEX "idx_unsigned_records" ON "clinical_records" ("tenantId", "createdAt") WHERE "signedAt" IS NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_unsigned_records"`);
    }
}
