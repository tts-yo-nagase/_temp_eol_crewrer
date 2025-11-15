# ベースイメージ
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ビルド
FROM base AS build
WORKDIR /app

# Copy prisma schema from root (build context is root directory)
COPY prisma ./prisma

# Copy backend files
COPY backend/package.json backend/pnpm-lock.yaml* ./backend/
COPY backend ./backend

WORKDIR /app/backend

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm prisma generate
RUN pnpm run build

# プロダクション
FROM base AS runner

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nestjs

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3010
ENV HOSTNAME="0.0.0.0"

# Copy prisma from build stage
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma

# Copy backend build artifacts
COPY --from=build --chown=nestjs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=build --chown=nestjs:nodejs /app/backend/package.json ./backend/package.json
COPY --from=build --chown=nestjs:nodejs /app/backend/pnpm-lock.yaml* ./backend/
COPY --from=build --chown=nestjs:nodejs /app/backend/dist ./backend/dist

WORKDIR /app/backend

USER nestjs

EXPOSE 3010

CMD ["pnpm", "run", "start:prod:docker"]
