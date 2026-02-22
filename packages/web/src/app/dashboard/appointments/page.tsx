'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { motion } from 'framer-motion';
import {
    Calendar,
    Plus,
    ChevronLeft,
    ChevronRight,
    Clock,
    User,
    Dog,
    Video,
    AlertCircle,
    Check,
    X,
    Stethoscope,
    Syringe,
    Scissors,
    Activity,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import AppointmentModal from '@/components/appointments/AppointmentModal';
import type { AppointmentFormData } from '@/components/appointments/AppointmentModal';
import '@/components/tutors/TutorModal.css';

const typeConfig: Record<string, { label: string; icon: typeof Stethoscope; color: string }> = {
    CONSULTATION: { label: 'Consulta', icon: Stethoscope, color: 'from-primary-500 to-primary-600' },
    VACCINATION: { label: 'Vacinação', icon: Syringe, color: 'from-accent-500 to-accent-600' },
    SURGERY: { label: 'Cirurgia', icon: Scissors, color: 'from-red-500 to-red-600' },
    FOLLOW_UP: { label: 'Follow-up', icon: Activity, color: 'from-blue-500 to-blue-600' },
    EMERGENCY: { label: 'Emergência', icon: AlertCircle, color: 'from-orange-500 to-orange-600' },
    TELECONSULT: { label: 'Teleconsulta', icon: Video, color: 'from-purple-500 to-purple-600' },
};

const statusConfig: Record<string, { label: string; badge: string }> = {
    SCHEDULED: { label: 'Agendado', badge: 'badge-info' },
    CONFIRMED: { label: 'Confirmado', badge: 'badge-success' },
    CHECKED_IN: { label: 'Check-in', badge: 'badge-success' },
    IN_PROGRESS: { label: 'Em curso', badge: 'badge-warning' },
    COMPLETED: { label: 'Concluído', badge: 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400' },
    CANCELLED: { label: 'Cancelado', badge: 'badge-danger' },
    NO_SHOW: { label: 'Não compareceu', badge: 'badge-danger' },
};

const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function AppointmentsPage() {
    const [view, setView] = useState<'day' | 'week'>('day');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const today = new Date();
    const [appointments, setAppointments] = useState<any[]>([]);

    const fetchAppointments = async () => {
        try {
            const [animalsRes, tutorsRes, vetsRes, appointmentsRes] = await Promise.all([
                api.get<{ data: any[] }>('/animals'),
                api.get<{ data: any[] }>('/tutors'),
                api.get<{ data: any[] }>('/users', { role: 'VETERINARIAN' }),
                api.get<{ data: any[] }>('/appointments'),
            ]);

            const aMap: Record<string, string> = {};
            animalsRes.data.forEach((a: any) => (aMap[a.id] = a.name));

            const tMap: Record<string, string> = {};
            tutorsRes.data.forEach((t: any) => (tMap[t.id] = `${t.firstName} ${t.lastName}`));

            const vMap: Record<string, string> = {};
            vetsRes.data.forEach((v: any) => (vMap[v.id] = `Dr. ${v.firstName} ${v.lastName}`));

            const mapped = appointmentsRes.data.map((apt: any) => {
                const start = new Date(apt.scheduledAt);
                const end = new Date(start.getTime() + apt.duration * 60000);
                return {
                    id: apt.id,
                    time: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    animal: aMap[apt.animalId] || 'Desconhecido',
                    tutor: tMap[apt.tutorId] || 'Desconhecido',
                    type: apt.appointmentType,
                    status: apt.status,
                    vet: vMap[apt.veterinarianId] || 'Desconhecido',
                };
            });
            setAppointments(mapped);
        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleCreateAppointment = async (data: AppointmentFormData) => {
        try {
            const start = new Date(`${data.date}T${data.time}`);
            const end = new Date(`${data.date}T${data.endTime}`);
            const duration = (end.getTime() - start.getTime()) / 60000; // minutes

            await api.post('/appointments', {
                scheduledAt: start,
                duration,
                appointmentType: data.type,
                notes: data.notes,
                animalId: data.animalId,
                tutorId: data.tutorId,
                veterinarianId: data.veterinarianId,
            });

            await fetchAppointments();
            setIsCreateOpen(false);
        } catch (error) {
            console.error('Failed to create appointment', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        Agenda
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">
                        {appointments.length} consultas hoje
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View toggle */}
                    <div className="flex bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
                        {(['day', 'week'] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${view === v
                                    ? 'bg-white dark:bg-surface-700 text-primary-600 shadow-sm'
                                    : 'text-surface-500 hover:text-surface-700'
                                    }`}
                            >
                                {v === 'day' ? 'Dia' : 'Semana'}
                            </button>
                        ))}
                    </div>

                    {/* Date nav */}
                    <div className="flex items-center gap-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-1.5">
                        <button aria-label="Dia anterior" className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors">
                            <ChevronLeft className="w-4 h-4 text-surface-500" />
                        </button>
                        <span className="text-sm font-medium text-surface-700 dark:text-surface-300 min-w-[140px] text-center">
                            {today.toLocaleDateString('pt-AO', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                        <button aria-label="Dia seguinte" className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors">
                            <ChevronRight className="w-4 h-4 text-surface-500" />
                        </button>
                    </div>

                    <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateOpen(true)}>
                        Nova Consulta
                    </Button>
                </div>
            </div>

            {/* Day View — Timeline */}
            <div className="glass-card overflow-hidden">
                <div className="grid grid-cols-[80px_1fr] divide-x divide-surface-100 dark:divide-surface-800">
                    {/* Time column header */}
                    <div className="p-3 bg-surface-50 dark:bg-surface-800/50 border-b border-surface-100 dark:border-surface-800">
                        <Clock className="w-4 h-4 text-surface-400 mx-auto" />
                    </div>
                    <div className="p-3 bg-surface-50 dark:bg-surface-800/50 border-b border-surface-100 dark:border-surface-800">
                        <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider px-2">
                            Consultas
                        </p>
                    </div>
                </div>

                {/* Appointments list */}
                <div className="divide-y divide-surface-50 dark:divide-surface-800/50">
                    {appointments.map((apt, i) => {
                        const config = typeConfig[apt.type];
                        const status = statusConfig[apt.status];
                        const Icon = config?.icon || Stethoscope;

                        return (
                            <motion.div
                                key={apt.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="grid grid-cols-[80px_1fr] divide-x divide-surface-100 dark:divide-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors cursor-pointer group"
                            >
                                {/* Time */}
                                <div className="p-4 flex flex-col items-center justify-center">
                                    <span className="text-sm font-mono font-semibold text-surface-700 dark:text-surface-300">
                                        {apt.time}
                                    </span>
                                    <span className="text-2xs text-surface-400">{apt.endTime}</span>
                                </div>

                                {/* Appointment card */}
                                <div className="p-4 flex items-center gap-4">
                                    <div
                                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config?.color || 'from-surface-400 to-surface-500'} flex items-center justify-center shadow-md flex-shrink-0`}
                                    >
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">
                                                {config?.label || apt.type}
                                            </p>
                                            <span className={`badge ${status?.badge || 'badge-info'}`}>
                                                {status?.label || apt.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-surface-500">
                                            <span className="flex items-center gap-1">
                                                <Dog className="w-3 h-3" /> {apt.animal}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" /> {apt.tutor}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Stethoscope className="w-3 h-3" /> {apt.vet}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quick actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {apt.status === 'SCHEDULED' && (
                                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-success hover:bg-success-light dark:hover:bg-success/20 transition-colors" title="Confirmar">
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                        {(apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && (
                                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-danger hover:bg-danger-light dark:hover:bg-danger/20 transition-colors" title="Cancelar">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Agendadas', value: 4, color: 'text-info' },
                    { label: 'Confirmadas', value: 1, color: 'text-success' },
                    { label: 'Em curso', value: 1, color: 'text-warning' },
                    { label: 'Concluídas', value: 1, color: 'text-surface-500' },
                ].map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.08 }}
                        className="glass-card p-4 text-center"
                    >
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-surface-500 mt-1">{s.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Create Appointment Modal */}
            <AppointmentModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreateAppointment}
            />
        </div>
    );
}
