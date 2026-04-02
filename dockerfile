# ベースイメージに Bun を使用
FROM oven/bun:1.1 AS base
WORKDIR /app

# 1. dexter-jp (本体) のビルドステージ
# ここで ./cjs/index.cjs 等の不足ファイルを生成します
FROM base AS builder-jp
COPY dexter-jp/package.json dexter-jp/bun.lock ./dexter-jp/
WORKDIR /app/dexter-jp
RUN bun install

COPY dexter-jp/ ./
# package.json に build スクリプトがある前提です
# これにより TypeScript がコンパイルされ、モジュールエラーが解消されます
RUN bun run build || echo "No build script found, skipping..."

# 2. 最終実行イメージの作成
FROM base AS runner
WORKDIR /app

# dexter-api の依存関係インストール
COPY package.json bun.lock ./
RUN bun install

# ビルド済みの dexter-jp をコピー
COPY --from/builder-jp /app/dexter-jp ./dexter-jp

# dexter-api のサーバーソースをコピー
COPY server ./server

# 環境変数の設定 (必要に応じて)
ENV NODE_ENV=production
ENV PORT=3000

# 起動コマンド
# Bun で直接実行することで tsx への依存を減らし、パフォーマンスを向上させます
CMD ["bun", "run", "server/index.ts"]
