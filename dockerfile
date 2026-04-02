FROM oven/bun:latest

WORKDIR /app

COPY . .

RUN git submodule update --init --recursive

RUN bun install

EXPOSE 3000

CMD ["bun", "run", "start"]
