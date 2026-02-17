// ============================================================================
// Roles & Permissions Constants
// ============================================================================

import type { UserRole } from '../types/auth';

export interface RoleDefinition {
    role: UserRole;
    label: string;
    description: string;
    level: number; // Higher = more permissions
}

export const ROLES: RoleDefinition[] = [
    {
        role: 'SUPER_ADMIN',
        label: 'Super Administrador',
        description: 'Acesso total ao sistema',
        level: 100,
    },
    {
        role: 'CLINIC_ADMIN',
        label: 'Administrador da Clínica',
        description: 'Gerencia a clínica, utilizadores e configurações',
        level: 80,
    },
    {
        role: 'VETERINARIAN',
        label: 'Veterinário',
        description: 'Acesso a prontuários, consultas e prescrições',
        level: 60,
    },
    {
        role: 'TECHNICIAN',
        label: 'Técnico Veterinário',
        description: 'Auxílio clínico, triagem e procedimentos',
        level: 40,
    },
    {
        role: 'RECEPTIONIST',
        label: 'Recepcionista',
        description: 'Agendamento, check-in e faturamento',
        level: 20,
    },
    {
        role: 'CLIENT',
        label: 'Cliente / Tutor',
        description: 'Acesso ao portal do cliente',
        level: 10,
    },
];

export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
    SUPER_ADMIN: ['CLINIC_ADMIN', 'VETERINARIAN', 'TECHNICIAN', 'RECEPTIONIST', 'CLIENT'],
    CLINIC_ADMIN: ['VETERINARIAN', 'TECHNICIAN', 'RECEPTIONIST', 'CLIENT'],
    VETERINARIAN: ['TECHNICIAN'],
    TECHNICIAN: [],
    RECEPTIONIST: [],
    CLIENT: [],
};
