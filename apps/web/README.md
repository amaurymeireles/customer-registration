# Cadastro de Clientes

Aplicacao web em Next.js para cadastro de clientes. O formulario valida os dados no navegador, envia os registros para a API e consulta os cadastros salvos no banco.

## O que mudou

- O envio do formulario acontece via `POST /api/clients`
- A listagem usa `GET /api/clients`
- A unicidade de CPF e e-mail e garantida pela API e pelo banco
- O build gera arquivos estaticos em `out/`

## Stack

- Next.js 14
- React 18
- TypeScript

## Funcionalidades

- Cadastro com nome completo, CPF, e-mail, cor favorita e observacoes
- Validacao de CPF no cliente
- Mascara automatica de CPF
- Integracao com a API de cadastro
- Listagem resumida dos ultimos cadastros

## Como rodar

### Desenvolvimento

```bash
pnpm install
NEXT_PUBLIC_API_URL=http://localhost:3000 pnpm dev:web
```

Ou, se voce preferir configurar em arquivo dentro de `apps/web`:

```bash
cp .env.example .env.local
pnpm dev:web
```

Acesse `http://localhost:3000`.

Se preferir executar apenas dentro de `apps/web`:

```bash
pnpm install
pnpm dev
```

### Build estatico

```bash
pnpm build:web
```

Os arquivos finais sao gerados em `out/`.

### Preview local do build

```bash
pnpm --filter ./apps/web start
```

Esse comando serve a pasta `out/` com `python3 -m http.server`.

### Deploy em imagem unica

O deploy final pode usar uma unica imagem Docker na raiz do repositorio. Ela:

- builda o frontend em `apps/web/out`
- builda a API em `apps/api/dist`
- copia o frontend estatico para dentro da imagem da API
- serve frontend e backend no mesmo processo Node/Nest

Build:

```bash
docker build -t customer-registration .
```

Run:

```bash
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@HOST:5432/customer_registration" \
  customer-registration
```

## Estrutura principal

```text
src/
├── app/
│   ├── components/
│   │   └── RegistrationForm.tsx
│   ├── lib/
│   │   └── cpf.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
└── types/
    └── index.ts
```

## Observacoes

- A API precisa estar em execucao e acessivel pela URL configurada em `NEXT_PUBLIC_API_URL`
- O frontend usa a mesma origem por padrao quando `NEXT_PUBLIC_API_URL` nao e informada
