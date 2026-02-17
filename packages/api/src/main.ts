import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { TransformInterceptor } from './common/transform.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Security headers
    app.use(helmet());

    // Global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());

    // Global response transform
    app.useGlobalInterceptors(new TransformInterceptor());

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // CORS
    app.enableCors({
        origin: process.env.WEB_URL || 'http://localhost:3000',
        credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix('api');

    // Swagger / OpenAPI
    const config = new DocumentBuilder()
        .setTitle('VetSaaS Angola API')
        .setDescription('API para plataforma veterinária SaaS — Angola')
        .setVersion('0.1.0')
        .addBearerAuth(
            { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            'JWT',
        )
        .addTag('Auth', 'Autenticação e perfil')
        .addTag('Animals', 'Gestão de pacientes')
        .addTag('Tutors', 'Gestão de tutores')
        .addTag('Appointments', 'Agendamento')
        .addTag('Records', 'Prontuários clínicos')
        .addTag('Payments', 'Pagamentos e faturas')
        .addTag('Inventory', 'Inventário e farmácia')
        .addTag('Reports', 'Relatórios e exportação')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.API_PORT || 3001;
    await app.listen(port);
    console.log(`🐾 VetSaaS API running on http://localhost:${port}/api`);
    console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
