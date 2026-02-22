import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsPage from './page';

// Mock dependencies
jest.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    user: {
      firstName: 'John',
      lastName: 'Doe',
      phone: '123456789',
      email: 'john@example.com',
      role: 'CLINIC_ADMIN',
    },
  }),
}));

jest.mock('@/lib/api-client', () => ({
  api: {
    patch: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock icons to avoid issues and simplify
jest.mock('lucide-react', () => ({
  Settings: () => <div data-testid="icon-settings" />,
  Building2: () => <div data-testid="icon-building" />,
  Globe: () => <div data-testid="icon-globe" />,
  Shield: () => <div data-testid="icon-shield" />,
  Bell: () => <div data-testid="icon-bell" />,
  Users: () => <div data-testid="icon-users" />,
  Database: () => <div data-testid="icon-database" />,
  Save: () => <div data-testid="icon-save" />,
  Check: () => <div data-testid="icon-check" />,
  Eye: () => <div data-testid="icon-eye" />,
  EyeOff: () => <div data-testid="icon-eye-off" />,
  UserCircle: () => <div data-testid="icon-user-circle" />,
  Loader2: () => <div data-testid="icon-loader" />,
}));

// Mock UI components
jest.mock('@/components/ui', () => ({
  Button: ({ children, icon, ...props }: any) => (
    <button {...props}>
      {icon}
      {children}
    </button>
  ),
  Input: ({ label, ...props }: any) => {
    const id = `input-${label ? label.replace(/\s+/g, '-').toLowerCase() : Math.random()}`;
    return (
      <div>
        <label htmlFor={id}>{label}</label>
        <input id={id} {...props} />
      </div>
    );
  },
  Select: ({ label, options, ...props }: any) => (
    <div>
      <label>{label}</label>
      <select {...props}>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

jest.mock('@vetsaas/shared', () => ({
  ANGOLA_PROVINCES: ['Luanda', 'Benguela'],
}));

jest.mock('@/components/ui/Toast', () => ({
  toast: jest.fn(),
}));

describe('SettingsPage Benchmark', () => {
  it('renders correctly and measures render time', async () => {
    const start = performance.now();
    render(<SettingsPage />);
    const end = performance.now();

    console.log(`SettingsPage Render Time: ${end - start}ms`);

    expect(screen.getByText('Configurações')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Informações Pessoais')).toBeInTheDocument();
    });

    // Check if initial tab content is loaded
    await waitFor(() => {
      expect(screen.getByLabelText('Nome')).toHaveValue('John');
    });
  });
});
