# ベースイメージ
FROM oven/bun:1.1 AS base
WORKDIR /app

# 1. dexter-jp (本体) のビルドステージ
FROM base AS builder-jp

# better-sqlite3 などのネイティブモジュールのビルドに必要なパッケージをインストール
# これにより Python や C++ コンパイラが利用可能になります
USER root
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 依存関係のコピー
COPY dexter-jp/package.json dexter-jp/bun.lock* ./dexter-jp/
WORKDIR /app/dexter-jp

# --build-from-source を避けるために環境変数を設定（可能な場合）
ENV BUNDLE_SQLITE3=true

RUN bun install

# ソースコピーとビルド
COPY dexter-jp/ ./
RUN bun run build || echo "No build script found, skipping..."

# 2. 最終実行イメージ
FROM base AS runner
WORKDIR /app

# 実行環境にも必要なライブラリがある場合があるため最小限でインストール
# (sqlite3などはOS側のライブラリを要求することがあります)

COPY package.json bun.lock* ./
RUN bun install

# ビルド済みの dexter-jp をコピー
COPY --from=builder-jp /app/dexter-jp ./dexter-jp

# ソースコードをコピー
COPY server ./server

ENV NODE_ENV=production
ENV PORT=3000

CMD ["bun", "run", "server/index.ts"]
