FROM oven/bun:latest

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --trusted

COPY dexter-jp/package.json dexter-jp/bun.lockb* ./dexter-jp/
RUN cd dexter-jp && bun install --frozen-lockfile --trusted

COPY . .

RUN echo "=== Build completed ===" && \
    ls -la dexter-jp/src/api.ts || echo "api.ts NOT FOUND"

EXPOSE 3000
CMD ["bun", "run", "start"]
