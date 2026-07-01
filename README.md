# Cadastro de Clientes

Aplicação full-stack para cadastro de clientes com formulário web, API REST e banco de dados PostgreSQL.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (React), CSS puro |
| Backend | NestJS 11, Prisma ORM |
| Banco | PostgreSQL 16 |
| Container | Docker + docker compose |
| Gerenciador | pnpm 10 (monorepo) |

## Estrutura

```
customer-registration/
├── apps/
│   ├── api/          # API NestJS (porta 3000)
│   └── web/          # Frontend Next.js (porta 3001 em dev)
├── docker/
│   ├── Dockerfile    # Imagem multi-estágio (produção)
│   └── start.sh      # Script de entrada do container
├── docker-compose.yml
└── package.json      # Scripts raiz do monorepo
```

## Desenvolvimento

### Pré-requisitos

- Node.js >= 22 (`.nvmrc` — `22`)
- pnpm 10 (`corepack enable`)
- PostgreSQL (ou Docker para o banco)

### Setup local

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev:api   # API em http://localhost:3000
pnpm dev:web   # Frontend em http://localhost:3001
```

**Variáveis de ambiente** — copie `.env.example` para `.env` em cada app e ajuste se necessário.

### Testes

```bash
pnpm test:api
pnpm test:web
```

### Lint

```bash
pnpm lint:api
pnpm lint:web
```

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev:api` | Inicia a API em modo dev (porta 3000) |
| `pnpm dev:web` | Inicia o frontend em modo dev (porta 3001) |
| `pnpm test:api` | Testes do backend |
| `pnpm test:web` | Testes do frontend |
| `pnpm lint:api` | Lint do backend |
| `pnpm lint:web` | Lint do frontend |
| `pnpm docker:build` | Constrói a imagem Docker |
| `pnpm docker:up` | Sobe todos os containers em background |
| `pnpm docker:up:build` | Constrói e sobe em um comando |
| `pnpm docker:db` | Sobe apenas o PostgreSQL |

## Docker

A imagem combina frontend e backend em um único container. O NestJS serve tanto a API quanto os arquivos estáticos do Next.js (exportados como HTML estático) na porta 3000.

```bash
pnpm docker:build       # docker compose build
pnpm docker:up          # docker compose up -d
pnpm docker:up:build    # build + up em um comando
```

Acesse em **http://localhost:3000**.

### Apenas banco (desenvolvimento local)

```bash
pnpm docker:db    # docker compose up -d postgres
```

Sobe somente o PostgreSQL. Útil para rodar `pnpm dev:api` e `pnpm dev:web` manualmente.

### Arquitetura em produção

```
Navegador
    │
    ├── GET /              → NestJS serve index.html (Next.js estático)
    ├── GET /_next/static/* → NestJS serve assets estáticos
    └── POST /api/clients  → NestJS (validação → Prisma → PostgreSQL)
```

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check |
| GET | `/api/clients` | Lista todos os clientes |
| POST | `/api/clients` | Cadastra novo cliente |

### Exemplo de requisição

```json
POST /api/clients
{
  "fullName": "Maria da Silva",
  "cpf": "529.982.247-25",
  "email": "maria@email.com",
  "favoriteColor": "VERDE",
  "observations": "Cliente prefere contato por e-mail"
}
```

## Variáveis de ambiente

| Variável | Padrão | Onde |
|----------|--------|------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/customer_registration` | API |
| `PORT` | `3000` | API |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | Web |

## Commits

Conventional Commits com lint-staged + husky. Testes e lint rodam automaticamente no pre-commit.