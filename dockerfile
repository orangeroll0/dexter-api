FROM oven/bun:latest

WORKDIR /app

COPY . .

RUN echo "=== BUILD CONTEXT ===" && ls -R .

RUN echo "=== LISTING /app ===" && ls -R /app

RUN bun install

WORKDIR /app/dexter-jp
RUN apt-get update && apt-get install -y python3 make g++ && apt-get clean
RUN bun install

WORKDIR /app

EXPOSE 3000

CMD ["bun", "run", "start"]
