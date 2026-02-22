import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from './user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { TenantsModule } from '../tenants/tenants.module';

export const jwtConfigFactory = (config: ConfigService) => {
    const secret = config.get('JWT_SECRET');
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not defined');
    }
    return {
        secret,
        signOptions: {
            expiresIn: config.get('JWT_EXPIRES_IN', '15m'),
        },
    };
};

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: jwtConfigFactory,
            inject: [ConfigService],
        }),
        TenantsModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule { }
