// ============================================================================
// Notifications Controller
// ============================================================================

import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { RegisterDeviceDto } from './notifications.dto';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post('device')
    async registerDevice(@Request() req: any, @Body() dto: RegisterDeviceDto) {
        await this.notificationsService.registerDevice(
            req.user.sub,
            dto.token,
            dto.platform,
        );
        return { success: true, message: 'Device token registered successfully' };
    }
}
