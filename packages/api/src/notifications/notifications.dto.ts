import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DevicePlatform } from './device-token.entity';

export class RegisterDeviceDto {
    @IsNotEmpty()
    @IsString()
    token: string;

    @IsNotEmpty()
    @IsEnum(DevicePlatform)
    platform: DevicePlatform;
}
