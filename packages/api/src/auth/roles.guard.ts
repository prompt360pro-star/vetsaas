import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { ROLE_HIERARCHY } from '@vetsaas/shared';
import type { UserRole } from '@vetsaas/shared';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // No @Roles() decorator → allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.role) {
            throw new ForbiddenException('No role assigned');
        }

        const userRole = user.role as UserRole;

        // Check if user's role matches any required role directly
        if (requiredRoles.includes(userRole)) {
            return true;
        }

        // Check hierarchy — does the user's role inherit any of the required roles?
        const inheritedRoles = ROLE_HIERARCHY[userRole] || [];
        const hasAccess = requiredRoles.some((required) =>
            inheritedRoles.includes(required),
        );

        if (!hasAccess) {
            throw new ForbiddenException(
                `Role '${userRole}' does not have permission. Required: ${requiredRoles.join(', ')}`,
            );
        }

        return true;
    }
}
