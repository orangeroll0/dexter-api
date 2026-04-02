FROM oven/bun:latest

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

WORKDIR /app

# 1. 最小限のシステム依存（better-sqlite3対応のため build-essential は残す）
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 2. 依存インストール（キャッシュを強く効かせる）
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

COPY dexter-jp/package.json dexter-jp/bun.lockb* ./dexter-jp/
RUN cd dexter-jp && bun install --frozen-lockfile

# 3. ソースコード（最後にコピー）
COPY . .

# 4. 軽いデバッグ出力
RUN echo "=== Build completed ===" && \
    ls -la dexter-jp/src/api.ts || echo "api.ts NOT FOUND"

EXPOSE 3000
CMD ["bun", "run", "start"]
