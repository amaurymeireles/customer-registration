# ------------------------------------------------------
# Base stage
# ------------------------------------------------------
FROM node:22-alpine AS base

RUN apk add --no-cache openssl \
    && corepack enable

WORKDIR /app

# ------------------------------------------------------
# Builder stage
# ------------------------------------------------------
FROM base AS builder

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .

COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile --prefer-offline

COPY apps ./apps

RUN pnpm db:generate
RUN pnpm build:api
RUN pnpm build:web

# ------------------------------------------------------
# Runner stage
# ------------------------------------------------------
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/api/node_modules ./apps/api/node_modules

COPY --from=builder --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=node:node /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=node:node /app/apps/api/package.json ./apps/api/package.json

COPY --from=builder --chown=node:node /app/apps/web/out ./public

COPY --from=builder --chown=node:node /app/package.json .
COPY --from=builder --chown=node:node /app/pnpm-workspace.yaml .
COPY --chown=node:node docker/start.sh /app/start.sh

RUN chmod +x /app/start.sh

USER node

EXPOSE 3000

CMD ["/app/start.sh"]
