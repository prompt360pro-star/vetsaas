import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { DevicePlatform } from "./device-token.entity";

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEnum(DevicePlatform)
  @IsNotEmpty()
  platform: DevicePlatform;
}
