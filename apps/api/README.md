# Cadastro de Clientes API

API backend em NestJS para cadastro unico de clientes com PostgreSQL e Prisma.

## Stack

| Camada | Tecnologia |
|--------|------------|
| API | NestJS 11, TypeScript |
| ORM | Prisma |
| Banco de dados | PostgreSQL 16 |
| Containerizacao | Docker + docker compose |

## Funcionalidades

- Cadastro de cliente com nome completo, CPF, e-mail, cor favorita e observacoes
- Validacao de CPF com algoritmo oficial
- Restricao de CPF unico no banco e na camada de servico
- Respostas JSON consistentes para sucesso, validacao e conflito
- Boot de producao com `prisma migrate deploy` automatico

## Executando com Docker

```bash
cp .env.example .env
docker compose up -d --build
```

API disponivel em `http://localhost:3000`.

Para parar:

```bash
docker compose down
docker compose down -v
```

## Desenvolvimento local

Pela raiz do monorepo:

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm db:generate
pnpm db:migrate
pnpm dev:api
```

Ou, se preferir rodar apenas dentro de `apps/api`:

```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Se quiser subir apenas o banco via Docker:

```bash
docker compose up db -d
```

## Endpoints

### `GET /health`

Healthcheck simples da aplicacao.

### `GET /api/clients`

Lista os clientes cadastrados, do mais recente para o mais antigo.

Resposta `200`:

```json
{
  "success": true,
  "data": [
    {
      "id": "clx123...",
      "fullName": "Maria da Silva",
      "cpf": "12345678909",
      "email": "maria@exemplo.com",
      "favoriteColor": "VERDE",
      "observations": "Texto opcional",
      "createdAt": "2026-06-28T18:30:00.000Z"
    }
  ]
}
```

### `POST /api/clients`

Registra um novo cliente.

Body:

```json
{
  "fullName": "Maria da Silva",
  "cpf": "123.456.789-09",
  "email": "maria@exemplo.com",
  "favoriteColor": "VERDE",
  "observations": "Texto opcional"
}
```

Cores aceitas: `VERMELHO`, `LARANJA`, `AMARELO`, `VERDE`, `AZUL`, `ANIL`, `VIOLETA`

Respostas:

| Status | Descricao |
|--------|-----------|
| `201` | Cadastro realizado com sucesso |
| `409` | CPF ja cadastrado |
| `422` | Dados invalidos |
| `500` | Erro interno |

## Estrutura

```text
src/
├── clients/
│   ├── dto/
│   ├── clients.controller.ts
│   ├── clients.module.ts
│   └── clients.service.ts
├── common/
│   ├── filters/
│   ├── utils/
│   └── validators/
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── app.controller.ts
├── app.module.ts
└── main.ts
```

## Variaveis de ambiente

| Variavel | Descricao | Padrao |
|----------|-----------|--------|
| `DATABASE_URL` | Conexao do PostgreSQL usada pelo Prisma | — |
| `POSTGRES_USER` | Usuario do banco no `docker compose` | `postgres` |
| `POSTGRES_PASSWORD` | Senha do banco no `docker compose` | `postgres` |
| `POSTGRES_DB` | Nome do banco no `docker compose` | `customer_registration` |
