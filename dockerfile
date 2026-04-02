FROM oven/bun:latest

WORKDIR /app

COPY . .

RUN echo "=== BUILD CONTEXT ===" && ls -R .

RUN echo "=== LISTING /app ===" && ls -R /app

RUN bun install

EXPOSE 3000

CMD ["bun", "run", "start"]
