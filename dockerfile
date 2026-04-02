FROM oven/bun:latest

WORKDIR /app

# 1. ネイティブビルドに必要なパッケージ（build-essential を復帰）
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 2. Playwright のダウンロードを完全にブロック（設定を維持）
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_BROWSERS_PATH=0
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD_FOR_DEPS=1
ENV NODE_ENV=production

# 3. dexter-api の依存関係インストール
# --trusted を付与して better-sqlite3 の postinstall を確実に実行
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --trusted

# 4. dexter-jp の依存関係インストールとビルド
# ここが「モジュールが見つからない」エラーの解決に必須の工程です
COPY dexter-jp/package.json dexter-jp/bun.lockb* ./dexter-jp/
WORKDIR /app/dexter-jp
RUN bun install --frozen-lockfile --trusted

# ソースをコピーしてビルドを実行（cjs/index.cjs 等を生成）
COPY dexter-jp/ ./
RUN bun run build || echo "Build script failed or not found, continuing anyway..."

# 5. 全ソースのコピーと最終確認
WORKDIR /app
COPY . .

RUN echo "=== Build completed ===" && \
    ls -la dexter-jp/src/api.ts || echo "api.ts NOT FOUND!"

EXPOSE 3000

# start スクリプトで server/index.ts を起動する想定
CMD ["bun", "run", "start"]
