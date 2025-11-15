# ベースイメージ
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ビルドステージ
FROM base AS builder
WORKDIR /app

# Copy frontend files
COPY frontend/package.json frontend/pnpm-lock.yaml* ./frontend/

# 依存関係をインストール
WORKDIR /app/frontend
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

# ソースコードをコピー
COPY frontend ./

# Next.jsアプリケーションをビルド
RUN pnpm run build

# プロダクションステージ
FROM base AS runner

# 必要なパッケージをインストール
RUN apk add --no-cache libc6-compat

# 非rootユーザーを作成
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# 環境変数を設定
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 必要なファイルをビルダーからコピー
COPY --from=builder --chown=nextjs:nodejs /app/frontend/next.config.mjs ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/frontend/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/frontend/package.json ./package.json

# 非rootユーザーに切り替え
USER nextjs

# ポートを公開
EXPOSE 3000

# アプリケーションを起動
CMD ["pnpm", "start"] 
