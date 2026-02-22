'use client';

import { Building2, Globe, Save } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { ANGOLA_PROVINCES } from '@vetsaas/shared';

export default function ClinicSettings() {
    return (
        <div className="space-y-6">
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-5 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary-500" />
                    Dados da Clínica
                </h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Nome da Clínica" placeholder="Clínica Veterinária Angola" />
                        <Input label="NIF" placeholder="5417XXXXXXX" hint="Contribuinte fiscal" />
                    </div>
                    <Input label="Email" type="email" placeholder="info@clinica.ao" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Telefone" placeholder="+244 2XX XXX XXX" />
                        <Input label="Website" placeholder="www.clinica.ao" />
                    </div>
                    <Input label="Morada" placeholder="Rua, número, bairro" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Cidade" placeholder="Luanda" />
                        <Select
                            label="Província"
                            placeholder="Selecionar"
                            options={ANGOLA_PROVINCES.map((p) => ({ value: p, label: p }))}
                        />
                    </div>
                </div>
            </div>

            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-5 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-accent-500" />
                    Preferências Regionais
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                        label="Moeda"
                        options={[
                            { value: 'AOA', label: 'Kwanza (AOA)' },
                            { value: 'USD', label: 'Dólar (USD)' },
                        ]}
                    />
                    <Select
                        label="Fuso Horário"
                        options={[{ value: 'Africa/Luanda', label: 'Africa/Luanda (WAT)' }]}
                    />
                    <Select
                        label="Idioma"
                        options={[
                            { value: 'pt-AO', label: 'Português (Angola)' },
                            { value: 'en', label: 'English' },
                        ]}
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <Button icon={<Save className="w-4 h-4" />}>Guardar Alterações</Button>
            </div>
        </div>
    );
}
