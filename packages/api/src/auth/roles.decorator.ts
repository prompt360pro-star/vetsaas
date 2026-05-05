import { SetMetadata } from "@nestjs/common";
import type { UserRole } from "@vetsaas/shared";

export const ROLES_KEY = "roles";

/**
 * Decorator to restrict endpoint access to specific roles.
 * Uses role hierarchy — e.g. CLINIC_ADMIN inherits VETERINARIAN access.
 *
 * @example
 * @Roles('CLINIC_ADMIN')
 * @Roles('VETERINARIAN')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
