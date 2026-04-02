FROM oven/bun:latest

WORKDIR /app

# 最小システム依存（build-essentialは一旦外してテスト）
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Playwright ブラウザダウンロード防止
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# 依存インストール（--trusted で postinstall を確実に実行）
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --trusted

COPY dexter-jp/package.json dexter-jp/bun.lockb* ./dexter-jp/
RUN cd dexter-jp && bun install --frozen-lockfile --trusted

COPY . .

# 確認
RUN echo "=== Build completed ===" && \
    ls -la dexter-jp/src/api.ts || echo "api.ts NOT FOUND"

EXPOSE 3000
CMD ["bun", "run", "start"]
