import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto, RefreshTokenDto } from "./auth.dto";
import { RateLimitGuard } from "../common/rate-limit.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @UseGuards(RateLimitGuard)
  async register(@Body() dto: RegisterDto) {
    const tokens = await this.authService.register(dto);
    return { success: true, data: tokens };
  }

  @Post("login")
  @UseGuards(RateLimitGuard)
  async login(@Body() dto: LoginDto) {
    const tokens = await this.authService.login(
      dto.email,
      dto.password,
      dto.mfaCode,
    );
    return { success: true, data: tokens };
  }

  @Post("refresh")
  async refresh(@Body() dto: RefreshTokenDto) {
    const tokens = await this.authService.refreshTokens(dto.refreshToken);
    return { success: true, data: tokens };
  }

  @Get("profile")
  @UseGuards(AuthGuard("jwt"))
  async getProfile(@Request() req: any) {
    const profile = await this.authService.getProfile(req.user.sub);
    return { success: true, data: profile };
  }

  @Patch("profile")
  @UseGuards(AuthGuard("jwt"))
  async updateProfile(
    @Request() req: any,
    @Body() body: { firstName?: string; lastName?: string; phone?: string },
  ) {
    const profile = await this.authService.updateProfile(req.user.sub, body);
    return { success: true, data: profile };
  }

  @Post("change-password")
  @UseGuards(AuthGuard("jwt"))
  async changePassword(
    @Request() req: any,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    await this.authService.changePassword(
      req.user.sub,
      body.oldPassword,
      body.newPassword,
    );
    return { success: true, message: "Password updated successfully" };
  }
}
