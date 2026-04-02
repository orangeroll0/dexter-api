FROM oven/bun:latest

WORKDIR /app

# 1. システム依存（better-sqlite3などのネイティブモジュール用）
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 2. ルート依存を先にコピー（キャッシュを効かせる）
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# 3. dexter-jp の依存を先にコピー（キャッシュを効かせる）
COPY dexter-jp/package.json dexter-jp/bun.lock* ./dexter-jp/
RUN cd dexter-jp && bun install --frozen-lockfile

# 4. 残りの全ソースコードをコピー
COPY . .

# 5. デバッグ出力（Build Logs で確認したいときに便利）
RUN echo "=== Build completed ===" && \
    ls -la dexter-jp/src/api.ts && \
    echo "=== api.ts exists ===" || echo "api.ts NOT FOUND!"

EXPOSE 3000

# サーバー起動（明示的に server/index.ts を指定）
# CMD ["bun", "run", "server/index.ts"]
CMD ["bun", "run", "start"]
