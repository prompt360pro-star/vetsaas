# Documentação Completa do Projeto VetSaaS Angola

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Projeto](#arquitetura-do-projeto)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Configuração do Ambiente](#configuração-do-ambiente)
6. [Execução do Projeto](#execução-do-projeto)
7. [Funcionalidades](#funcionalidades)
8. [Componentes UI](#componentes-ui)
9. [API Endpoints](#api-endpoints)
10. [Testes](#testes)
11. [Docker e Deploy](#docker-e-deploy)
12. [Convenções de Código](#convenções-de-código)
13. [Considerações Legais](#considerações-legais)

## Visão Geral

O VetSaaS Angola é uma plataforma SaaS premium para clínicas veterinárias em Angola. O sistema oferece prontuário eletrônico, agendamento inteligente, integração com métodos de pagamento locais (Multicaixa, Unitel Money) e analytics em tempo real.

### Descrição do Projeto
- **Nome**: VetSaaS Angola
- **Tipo**: Plataforma SaaS veterinária
- **Objetivo**: Digitalização e automação de clínicas veterinárias em Angola
- **Características principais**:
  - Prontuário eletrônico completo
  - Sistema de agendamento inteligente
  - Integração com métodos de pagamento locais
  - Analytics em tempo real
  - Interface moderna com design glassmorphism

## Arquitetura do Projeto

O projeto utiliza uma arquitetura de monorepo com três pacotes principais:

1. **API (Backend)**: Servidor NestJS que fornece uma API REST
2. **Web (Frontend)**: Aplicação Next.js com interface moderna
3. **Shared (Compartilhado)**: Tipos, constantes e utilitários compartilhados

Essa arquitetura permite o desenvolvimento e versionamento conjunto dos componentes, facilitando a manutenção e consistência entre os diferentes módulos da aplicação.

## Tecnologias Utilizadas

### Frontend
- **Next.js 14**: Framework React com SSR e recursos avançados
- **React 18**: Biblioteca JavaScript para interfaces de usuário
- **Framer Motion**: Biblioteca para animações fluidas
- **Zustand**: Gerenciador de estado leve
- **TypeScript**: Superset do JavaScript com tipagem estática
- **CSS**: Sistema de design personalizado com glassmorphism e modo escuro

### Backend
- **NestJS 10**: Framework Node.js com arquitetura modular
- **TypeORM**: ORM para manipulação de banco de dados
- **PostgreSQL**: Banco de dados relacional

### Compartilhado
- **TypeScript**: Tipagem consistente entre frontend e backend
- **Bibliotecas utilitárias**: Constantes e funções compartilhadas

### Infraestrutura e Ferramentas
- **Docker**: Contêinerização dos serviços
- **Docker Compose**: Orquestração de múltiplos containers
- **pnpm**: Gerenciador de pacotes rápido e eficiente
- **Jest**: Framework de testes (108 testes implementados)
- **GitHub Actions**: Pipeline de CI/CD

## Estrutura de Pastas

```
vetsaas-angola/
├── packages/
│   ├── shared/        # Tipos, constantes, utilitários
│   ├── api/           # Backend NestJS (API REST)
│   └── web/           # Frontend Next.js (13 rotas)
├── .github/workflows/ # Pipeline CI
├── docker-compose.yml
├── Dockerfile.api
├── Dockerfile.web
└── package.json
```

### Estrutura Detalhada do Backend (API)
```
packages/api/
├── src/
│   ├── animals/          # Gerenciamento de animais
│   ├── appointments/     # Agendamentos
│   ├── auth/            # Autenticação
│   ├── common/          # Componentes comuns
│   ├── dashboard/       # Painel de controle
│   ├── database/        # Configurações de banco de dados
│   ├── health/          # Verificação de saúde do sistema
│   ├── inventory/       # Inventário
│   ├── main.ts          # Ponto de entrada principal
│   ├── notifications/   # Notificações
│   ├── payments/        # Pagamentos
│   ├── records/         # Registros clínicos
│   ├── storage/         # Armazenamento
│   ├── tenants/         # Tenants (multitenancy)
│   └── tutors/          # Tutores (donos de pets)
├── test/                # Testes E2E
└── package.json
```

### Estrutura Detalhada do Frontend (Web)
```
packages/web/
├── public/
│   └── manifest.json    # Configuração PWA
├── src/
│   ├── app/            # Rotas e páginas Next.js
│   ├── components/     # Componentes reutilizáveis
│   ├── lib/            # Bibliotecas e utilitários
│   ├── stores/         # Stores do Zustand
│   └── styles/         # Estilos globais
├── next.config.js      # Configuração do Next.js
├── tailwind.config.ts  # Configuração do Tailwind CSS
└── package.json
```

### Estrutura Detalhada do Shared
```
packages/shared/
├── src/
│   ├── constants/      # Constantes compartilhadas
│   ├── types/          # Tipos TypeScript
│   ├── utils/          # Funções utilitárias
│   ├── index.ts        # Exportações principais
│   └── index.spec.ts   # Testes unitários
└── package.json
```

## Configuração do Ambiente

### Pré-requisitos
- **Node.js** ≥ 20.0.0
- **pnpm** ≥ 9.0.0
- **PostgreSQL** 15+ (ou uso do Docker)

### Instalação
```bash
# 1. Clonar e instalar dependências
git clone <repo-url> && cd vetsaas-angola
pnpm install

# 2. Configurar variáveis de ambiente
cp packages/api/.env.example packages/api/.env
cp packages/web/.env.example packages/web/.env

# 3. Compilar o pacote compartilhado
pnpm --filter @vetsaas/shared build

# 4. Executar servidores de desenvolvimento
pnpm dev
```

### Variáveis de Ambiente

#### API (packages/api/.env)
| Variável | Descrição | Padrão |
|----------|-----------|--------|
| PORT | Porta da API | 3001 |
| DB_HOST | Host PostgreSQL | localhost |
| DB_PORT | Porta PostgreSQL | 5432 |
| DB_NAME | Nome do banco | vetsaas |
| DB_USER | Usuário banco | postgres |
| DB_PASS | Senha banco | - |
| JWT_SECRET | Chave JWT | - |
| JWT_EXPIRES_IN | Expiração token | 15m |
| CORS_ORIGIN | Origens permitidas | http://localhost:3000 |

#### Web (packages/web/.env)
| Variável | Descrição | Padrão |
|----------|-----------|--------|
| NEXT_PUBLIC_API_URL | URL da API | http://localhost:3001 |

## Execução do Projeto

### Modo Desenvolvimento
```bash
# Executar ambos API e Web
pnpm dev
```
A API rodará em `http://localhost:3001` e o Web em `http://localhost:3000`.

### Outros Comandos
| Comando | Descrição |
|---------|-----------|
| `pnpm build` | Compila todos os pacotes |
| `pnpm test` | Executa todos os testes (108 specs) |
| `pnpm lint` | Verifica linting em todos os pacotes |
| `pnpm type-check` | Verificação de tipos TypeScript |

## Funcionalidades

### 🏥 Clínico
- Registro de pacientes com classificação por espécie/raça
- Registros clínicos e histórico médico
- Rastreamento de vacinação com alertas de expiração
- Agendamento com fluxo de status

### 💰 Financeiro
- Gestão de pagamentos com moeda Kwanza
- Geração de faturas
- Análise de receita mensal

### 📦 Operações
- Gestão de inventário com alertas de estoque baixo
- CRM para tutores (donos de pets)
- Trilha de auditoria para conformidade

### 🎨 UI/UX
- **Modo Escuro** com alternância animada (Sol/Lua)
- **Paleta de Comandos** (`Cmd+K` / `Ctrl+K`) — busca difusa, navegação por teclado
- **Centro de Notificações** — agrupado por data, ícones específicos por tipo
- **Gráficos Sparkline** — SVG, preenchimento gradiente, desenho animado
- **Feed de Atividades** — linha do tempo com carimbos temporais relativos
- **Limite de Erro** — recuperação graciosa com tentativa
- **Design Glassmorphism** com microanimações suaves
- **PWA-ready** com manifesto e metatags

## Componentes UI

Biblioteca de componentes com 18 elementos:
- `Button` · `Input` · `Modal` · `Select` · `FileUpload` · `SearchBar` · `UserMenu` · `Toast` · `ConfirmDialog` · `EmptyState` · `Pagination` · `Tooltip` · `StatusBadge` · `DataTable` · `Sparkline` · `NotificationCenter` · `CommandPalette` · `ErrorBoundary`

## API Endpoints

A API REST fornece endpoints para todas as funcionalidades do sistema. A documentação Swagger está disponível em `http://localhost:3001/api/docs` quando o servidor está em execução.

### Principais Recursos da API
- Autenticação JWT
- CRUD completo para animais, tutores, agendamentos, registros clínicos
- Gerenciamento de inventário
- Processamento de pagamentos
- Dashboard com métricas em tempo real
- Notificações push
- Upload de arquivos

## Testes

O projeto inclui um extenso conjunto de testes:
- **108 testes** implementados
- **13 suítes** de testes
- **Testes unitários** e **testes E2E**
- Framework Jest para execução de testes
- Cobertura de código configurada

## Docker e Deploy

### Execução com Docker
```bash
# Iniciar PostgreSQL, API e Web
docker compose up -d
```

O docker-compose.yml configura:
- Servidor PostgreSQL
- Serviço da API
- Serviço da Web
- Conexão entre os serviços

### Imagens Docker
- `Dockerfile.api`: Container para o backend
- `Dockerfile.web`: Container para o frontend
- `Dockerfile`: Presente em cada pacote para deploy individual

## Convenções de Código

### TypeScript
- Tipagem estrita em todos os componentes
- Interfaces consistentes entre frontend e backend via pacote shared
- Uso de generics para componentes reutilizáveis

### Estilo de Código
- ESLint e Prettier configurados
- Conformidade com padrões do Next.js e NestJS
- Componentes modulares e reutilizáveis
- Separação clara de preocupações

### Git
- Estrutura de branches padronizada
- Mensagens de commit descritivas
- Workflow GitFlow ou similar

## Considerações Legais

- **Licença**: Privada — Todos os direitos reservados
- O código não pode ser redistribuído sem permissão
- Conformidade com regulamentações angolanas de proteção de dados
- Política de privacidade para dados de clínicas veterinárias