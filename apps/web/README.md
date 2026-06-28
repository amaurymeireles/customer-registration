# Cadastro de Clientes

Aplicacao frontend-only em Next.js para cadastro de clientes. O formulario valida os dados no navegador e salva os registros localmente com `localStorage`, sem API, banco de dados ou Docker.

## O que mudou

- O repo agora contem apenas a interface web
- O envio do formulario acontece no navegador
- A unicidade por CPF vale apenas no navegador atual
- O build gera arquivos estaticos em `out/`

## Stack

- Next.js 14
- React 18
- TypeScript

## Funcionalidades

- Cadastro com nome completo, CPF, e-mail, cor favorita e observacoes
- Validacao de CPF no cliente
- Mascara automatica de CPF
- Persistencia local no navegador
- Acao para limpar os cadastros locais durante testes

## Como rodar

### Desenvolvimento

```bash
pnpm install
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

- Os dados ficam salvos apenas no navegador/dispositivo usado no cadastro
- Limpar o armazenamento do navegador remove os registros
- Se voce quiser integrar uma API depois, o ponto principal a adaptar e `src/app/components/RegistrationForm.tsx`
