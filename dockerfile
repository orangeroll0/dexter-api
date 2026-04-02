# ベースイメージ
FROM oven/bun:1.1 AS base
WORKDIR /app

# 1. dexter-jp (本体) のビルドステージ
FROM base AS builder-jp
# ファイル名が不確定（bun.lock か bun.lockb か）なため、ワイルドカードを使用
COPY dexter-jp/package.json dexter-jp/bun.lock* ./dexter-jp/
WORKDIR /app/dexter-jp
RUN bun install

COPY dexter-jp/ ./
RUN bun run build || echo "No build script found, skipping..."

# 2. 最終実行イメージ
FROM base AS runner
WORKDIR /app

# dexter-api の依存関係 (ここもワイルドカードで bun.lock* とします)
COPY package.json bun.lock* ./
RUN bun install

# ビルド済みの dexter-jp をコピー
COPY --from=builder-jp /app/dexter-jp ./dexter-jp

# ソースコードをコピー
COPY server ./server

ENV NODE_ENV=production
ENV PORT=3000

CMD ["bun", "run", "server/index.ts"]
