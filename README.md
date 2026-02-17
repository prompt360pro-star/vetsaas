# 🐾 VetSaaS Angola

**Premium SaaS platform for veterinary clinics in Angola.**

Prontuário electrónico, agendamento inteligente, pagamentos locais (Multicaixa, Unitel Money) e analytics em tempo real — tudo num só lugar.

---

## Tech Stack

| Layer | Technology |
|-------|-----------| 
| **Frontend** | Next.js 14, React 18, Framer Motion, Zustand |
| **Backend** | NestJS 10, TypeORM, PostgreSQL |
| **Shared** | TypeScript monorepo (`@vetsaas/shared`) |
| **Styling** | Custom CSS design system (glassmorphism, dark mode) |
| **Testing** | Jest (108 tests, 13 suites) |
| **CI/CD** | GitHub Actions (lint → type-check → test → build → Docker) |
| **Package Manager** | pnpm workspaces |

## Monorepo Structure

```
vetsaas-angola/
├── packages/
│   ├── shared/        # Types, constants, utils
│   ├── api/           # NestJS backend (REST API)
│   └── web/           # Next.js frontend (13 routes)
├── .github/workflows/ # CI pipeline
├── docker-compose.yml
├── Dockerfile.api
├── Dockerfile.web
└── package.json
```

## Features

### 🏥 Clinical
- Patient registry with species/breed classification
- Clinical records & medical history
- Vaccination tracking with expiry alerts
- Appointment scheduling with status flow

### 💰 Financial
- Payment management with Kwanza currency
- Invoice generation
- Monthly revenue analytics

### 📦 Operations
- Inventory management with low-stock alerts
- Tutor (pet owner) CRM
- Audit trail for compliance

### 🎨 UI/UX
- **Dark mode** with animated toggle (Sun/Moon)
- **Command Palette** (`Cmd+K` / `Ctrl+K`) — fuzzy search, keyboard nav
- **Notification Center** — grouped by date, type-specific icons
- **Sparkline charts** — SVG, gradient fill, animated draw
- **Activity Feed** — timeline with relative timestamps
- **Error Boundary** — graceful error recovery with retry
- **Glassmorphism** design with smooth micro-animations
- **PWA-ready** manifest and meta tags

## UI Component Library (18 components)

`Button` · `Input` · `Modal` · `Select` · `FileUpload` · `SearchBar` · `UserMenu` · `Toast` · `ConfirmDialog` · `EmptyState` · `Pagination` · `Tooltip` · `StatusBadge` · `DataTable` · `Sparkline` · `NotificationCenter` · `CommandPalette` · `ErrorBoundary`

## Prerequisites

- **Node.js** ≥ 20.0.0
- **pnpm** ≥ 9.0.0
- **PostgreSQL** 15+ (or use Docker)

## Quick Start

```bash
# 1. Clone & install
git clone <repo-url> && cd vetsaas-angola
pnpm install

# 2. Environment
cp packages/api/.env.example packages/api/.env
cp packages/web/.env.example packages/web/.env

# 3. Build shared types
pnpm --filter @vetsaas/shared build

# 4. Run dev servers
pnpm dev
```

API runs on `http://localhost:3001`, Web on `http://localhost:3000`.

## Docker

```bash
docker compose up -d
```

Starts PostgreSQL, API, and Web. See `docker-compose.yml` for configuration.

## Commands

| Command | Description |
|---------|------------|
| `pnpm dev` | Start API + Web dev servers |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests (108 specs) |
| `pnpm lint` | Lint all packages |
| `pnpm type-check` | TypeScript type checking |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` / `Ctrl+K` | Open Command Palette |
| `↑` `↓` | Navigate palette results |
| `Enter` | Select palette command |
| `Esc` | Close palette / modals |

## Environment Variables

### API (`packages/api/.env`)

| Variable | Description | Default |
|----------|------------|---------| 
| `PORT` | API port | `3001` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `vetsaas` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASS` | Database password | — |
| `JWT_SECRET` | JWT signing key | — |
| `JWT_EXPIRES_IN` | Token expiry | `15m` |
| `CORS_ORIGIN` | Allowed origins | `http://localhost:3000` |

### Web (`packages/web/.env`)

| Variable | Description | Default |
|----------|------------|---------| 
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |

## API Documentation

Swagger UI available at `http://localhost:3001/api/docs` when the API is running.

## License

Private — All rights reserved.
