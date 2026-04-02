# ベースイメージに Bun を使用
FROM oven/bun:1.1 AS base
WORKDIR /app

# 1. dexter-jp (本体) のビルドステージ
FROM base AS builder-jp
# 依存関係ファイルを先にコピーしてキャッシュを利用
COPY dexter-jp/package.json dexter-jp/bun.lock ./dexter-jp/
WORKDIR /app/dexter-jp
RUN bun install

# ソースコードをコピーしてビルドを実行
COPY dexter-jp/ ./
RUN bun run build || echo "No build script found, skipping..."

# 2. 最終実行イメージの作成
FROM base AS runner
WORKDIR /app

# dexter-api の依存関係インストール
COPY package.json bun.lock ./
RUN bun install

# ビルド済みの dexter-jp をコピー（ここを修正しました）
COPY --from=builder-jp /app/dexter-jp ./dexter-jp

# dexter-api のサーバーソースをコピー
COPY server ./server

# 環境変数の設定
ENV NODE_ENV=production
ENV PORT=3000

# 起動コマンド
CMD ["bun", "run", "server/index.ts"]
