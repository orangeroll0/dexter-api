FROM oven/bun:1.0
WORKDIR /app
COPY . .
RUN bun install
RUN cd dexter-jp && bun install
EXPOSE 3000
CMD ["bun", "server/index.ts"]