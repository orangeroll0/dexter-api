FROM oven/bun:1.0

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install

COPY . .

RUN cd dexter-jp && bun install || true

EXPOSE 3000

CMD ["bun", "run", "start"]
