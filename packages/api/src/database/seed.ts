/**
 * Database seed script — creates demo data for VetSaaS Angola.
 *
 * Usage: pnpm --filter @vetsaas/api seed
 */
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { TenantEntity } from '../tenants/tenant.entity';
import { UserEntity } from '../auth/user.entity';
import { TutorEntity } from '../tutors/tutor.entity';
import { AnimalEntity } from '../animals/animal.entity';
import { AppointmentEntity } from '../appointments/appointment.entity';

const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'vetsaas',
    entities: [TenantEntity, UserEntity, TutorEntity, AnimalEntity, AppointmentEntity],
    synchronize: true,
});

async function seed() {
    await ds.initialize();
    console.log('🌱 Seeding VetSaaS database…');

    const tenantRepo = ds.getRepository(TenantEntity);
    const userRepo = ds.getRepository(UserEntity);
    const tutorRepo = ds.getRepository(TutorEntity);
    const animalRepo = ds.getRepository(AnimalEntity);
    const apptRepo = ds.getRepository(AppointmentEntity);

    // ── Tenant ───────────────────────────────────────
    let tenant = await tenantRepo.findOne({ where: { slug: 'clinica-demo' } });
    if (!tenant) {
        tenant = tenantRepo.create({
            id: uuid(),
            name: 'Clínica Veterinária Patinhas',
            slug: 'clinica-demo',
            email: 'info@patinhas.ao',
            phone: '+244 923 456 789',
            address: 'Rua dos Coqueiros, 42',
            city: 'Luanda',
            province: 'Luanda',
            country: 'AO',
            plan: 'PROFESSIONAL',
            settings: {},
            isActive: true,
        });
        tenant = await tenantRepo.save(tenant);
        console.log('  ✅ Tenant created');
    } else {
        console.log('  ⏭️  Tenant already exists');
    }

    // ── Admin User ───────────────────────────────────
    let admin = await userRepo.findOne({ where: { email: 'admin@patinhas.ao' } });
    if (!admin) {
        const hash = await bcrypt.hash('Admin@123', 12);
        admin = userRepo.create({
            id: uuid(),
            tenantId: tenant.id,
            email: 'admin@patinhas.ao',
            passwordHash: hash,
            firstName: 'Carlos',
            lastName: 'Mateus',
            role: 'ADMIN',
            phone: '+244 912 345 678',
            isActive: true,
        });
        admin = await userRepo.save(admin);
        console.log('  ✅ Admin user created (admin@patinhas.ao / Admin@123)');
    } else {
        console.log('  ⏭️  Admin already exists');
    }

    // ── Tutors ───────────────────────────────────────
    const tutorData = [
        { firstName: 'Maria', lastName: 'dos Santos', email: 'maria.santos@email.ao', phone: '+244 923 111 222', address: 'Bairro Miramar, Luanda' },
        { firstName: 'João', lastName: 'Fernandes', email: 'joao.fernandes@email.ao', phone: '+244 912 333 444', address: 'Talatona, Luanda' },
        { firstName: 'Ana', lastName: 'Miguel', email: 'ana.miguel@email.ao', phone: '+244 945 555 666', address: 'Maianga, Luanda' },
        { firstName: 'Pedro', lastName: 'Sebastião', email: 'pedro.sebastiao@email.ao', phone: '+244 926 777 888', address: 'Viana, Luanda' },
        { firstName: 'Luísa', lastName: 'Tavares', email: 'luisa.tavares@email.ao', phone: '+244 931 999 000', address: 'Cacuaco, Luanda' },
    ];

    const tutors: TutorEntity[] = [];
    for (const t of tutorData) {
        let tutor = await tutorRepo.findOne({ where: { email: t.email, tenantId: tenant.id } });
        if (!tutor) {
            tutor = tutorRepo.create({ id: uuid(), tenantId: tenant.id, ...t });
            tutor = await tutorRepo.save(tutor);
        }
        tutors.push(tutor);
    }
    console.log(`  ✅ ${tutors.length} tutors ready`);

    // ── Animals ──────────────────────────────────────
    const animalData = [
        { name: 'Rex', species: 'DOG', breed: 'Pastor Alemão', sex: 'M', color: 'Preto e castanho', weight: 32, tutorIdx: 0 },
        { name: 'Mimi', species: 'CAT', breed: 'Siamês', sex: 'F', color: 'Creme', weight: 4, tutorIdx: 0 },
        { name: 'Bobby', species: 'DOG', breed: 'Labrador', sex: 'M', color: 'Dourado', weight: 28, tutorIdx: 1 },
        { name: 'Luna', species: 'CAT', breed: 'Persa', sex: 'F', color: 'Branco', weight: 5, tutorIdx: 2 },
        { name: 'Thor', species: 'DOG', breed: 'Rottweiler', sex: 'M', color: 'Preto', weight: 42, tutorIdx: 3 },
        { name: 'Nina', species: 'DOG', breed: 'Golden Retriever', sex: 'F', color: 'Dourado', weight: 26, tutorIdx: 4 },
        { name: 'Simba', species: 'CAT', breed: 'Maine Coon', sex: 'M', color: 'Tabby', weight: 8, tutorIdx: 1 },
        { name: 'Pipoca', species: 'DOG', breed: 'Poodle', sex: 'F', color: 'Branco', weight: 6, tutorIdx: 3 },
    ];

    const animals: AnimalEntity[] = [];
    for (const a of animalData) {
        const existing = await animalRepo.findOne({ where: { name: a.name, tenantId: tenant.id } });
        if (!existing) {
            const animal = animalRepo.create({
                id: uuid(),
                tenantId: tenant.id,
                tutorIds: [tutors[a.tutorIdx].id],
                name: a.name,
                species: a.species,
                breed: a.breed,
                sex: a.sex,
                color: a.color,
                weight: a.weight,
                dateOfBirth: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)),
            });
            animals.push(await animalRepo.save(animal));
        } else {
            animals.push(existing);
        }
    }
    console.log(`  ✅ ${animals.length} animals ready`);

    // ── Appointments ─────────────────────────────────
    const now = new Date();
    const apptCount = await apptRepo.count({ where: { tenantId: tenant.id } });
    if (apptCount === 0) {
        const reasons = ['Consulta de rotina', 'Vacinação', 'Desparasitação', 'Cirurgia', 'Check-up geral', 'Emergência'];
        for (let i = 0; i < 6; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() + i);
            date.setHours(9 + i, 0, 0, 0);
            const appt = apptRepo.create({
                id: uuid(),
                tenantId: tenant.id,
                animalId: animals[i % animals.length].id,
                tutorId: tutors[i % tutors.length].id,
                veterinarianId: admin.id,
                scheduledAt: date,
                duration: 30,
                reason: reasons[i],
                status: i < 2 ? 'COMPLETED' : 'SCHEDULED',
            });
            await apptRepo.save(appt);
        }
        console.log('  ✅ 6 appointments created');
    } else {
        console.log(`  ⏭️  ${apptCount} appointments already exist`);
    }

    console.log('\n🎉 Seed complete!');
    await ds.destroy();
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
