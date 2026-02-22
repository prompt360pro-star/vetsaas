import {
    Controller,
    Get,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
    constructor(private readonly authService: AuthService) { }

    @Get()
    async findAll(@Request() req: any, @Query('role') role?: string) {
        const data = await this.authService.findAll(req.user.tenantId, role);
        return { success: true, data };
    }
}
