import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

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

    const port = process.env.API_PORT || 3001;
    await app.listen(port);
    console.log(`🐾 VetSaaS API running on http://localhost:${port}/api`);
}

bootstrap();
